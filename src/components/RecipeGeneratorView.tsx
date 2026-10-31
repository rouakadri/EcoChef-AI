import React, { useState, useEffect } from 'react';
import {
  ChefHat,
  Sparkles,
  Clock,
  Users,
  CheckCircle2,
  Volume2,
  VolumeX,
  Flame,
  Euro,
  Trees,
  ArrowRight,
  Info,
  Check,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Recipe } from '../types';

export default function RecipeGeneratorView() {
  const { t, language, inventory, celebrate, showToast, isRtl } = useApp();

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedDiet, setSelectedDiet] = useState<string>('none');
  const [selectedMealType, setSelectedMealType] = useState<string>('dinner');
  const [activeSpeechRecipeId, setActiveSpeechRecipeId] = useState<string | null>(null);
  const [completedSteps, setCompletedSteps] = useState<{ [recipeId: string]: number[] }>({});

  // Urgent items in stock
  const urgentItems = inventory.filter((item) => {
    const diff = Math.ceil((new Date(item.expiryDate).getTime() - new Date().getTime()) / 86400000);
    return diff <= 3;
  });

  const generateNewRecipes = async () => {
    setIsGenerating(true);
    stopSpeaking();
    try {
      const res = await fetch('/api/recipes/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dietary: selectedDiet,
          mealType: selectedMealType,
          lang: language,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setRecipes(data.recipes || []);
        celebrate();
      }
    } catch (err) {
      console.error('Error generating recipes:', err);
      showToast('Erreur lors de la génération', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    // Generate initial recipes on load
    generateNewRecipes();
    return () => {
      stopSpeaking();
    };
  }, []);

  // Web Speech API for reading aloud instructions
  const toggleSpeech = (recipe: Recipe) => {
    if (activeSpeechRecipeId === recipe.id) {
      stopSpeaking();
      return;
    }

    if (!('speechSynthesis' in window)) {
      showToast('Synthèse vocale non disponible sur ce navigateur', 'info');
      return;
    }

    window.speechSynthesis.cancel();
    const textToRead = `${recipe.title}. ${recipe.subtitle}. Ingrédients principaux : ${recipe.savedIngredients.join(', ')}. Instructions : ${recipe.instructions.join('. ')}. Conseil du chef : ${recipe.chefTip}`;

    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = language === 'ar' ? 'ar-SA' : language === 'en' ? 'en-US' : 'fr-FR';
    utterance.rate = 0.95;

    utterance.onend = () => setActiveSpeechRecipeId(null);
    utterance.onerror = () => setActiveSpeechRecipeId(null);

    window.speechSynthesis.speak(utterance);
    setActiveSpeechRecipeId(recipe.id);
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setActiveSpeechRecipeId(null);
  };

  const toggleStep = (recipeId: string, stepIndex: number) => {
    setCompletedSteps((prev) => {
      const current = prev[recipeId] || [];
      const updated = current.includes(stepIndex)
        ? current.filter((i) => i !== stepIndex)
        : [...current, stepIndex];
      return { ...prev, [recipeId]: updated };
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>EcoChef Gemini 3.8 Flash AI</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            {t.recipes.title}
          </h2>
          <p className="text-stone-700 text-xs sm:text-sm mt-0.5 max-w-2xl">
            {t.recipes.subtitle}
          </p>
        </div>

        <button
          onClick={generateNewRecipes}
          disabled={isGenerating}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-extrabold shadow-md shadow-emerald-800/20 transition-all cursor-pointer disabled:opacity-50 whitespace-nowrap"
        >
          {isGenerating ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>{t.recipes.generating}</span>
            </>
          ) : (
            <>
              <ChefHat className="w-4 h-4 text-emerald-200" />
              <span>{t.recipes.generateBtn}</span>
            </>
          )}
        </button>
      </div>

      {/* Filter toolbar: Dietary & Meal Types */}
      <div className="p-4 rounded-3xl bg-white border border-stone-200/80 shadow-xs space-y-3">
        {/* Urgent items prompt */}
        {urgentItems.length > 0 && (
          <div className="flex items-center gap-2 text-xs font-bold text-amber-800 bg-amber-50 px-3 py-2 rounded-xl border border-amber-200/80">
            <Flame className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              Ingrédients prioritaires injectés : {urgentItems.map((i) => i.name).slice(0, 4).join(', ')}
            </span>
          </div>
        )}

        {/* Dietary Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-bold text-stone-600 mr-1">Régime :</span>
          {[
            { id: 'none', label: t.recipes.dietNone },
            { id: 'vegetarian', label: `🌱 ${t.recipes.dietVegetarian}` },
            { id: 'gluten_free', label: `🌾 ${t.recipes.dietGlutenFree}` },
            { id: 'halal', label: `✨ ${t.recipes.dietHalal}` },
            { id: 'quick', label: `⚡ ${t.recipes.dietQuick}` },
          ].map((diet) => (
            <button
              key={diet.id}
              onClick={() => setSelectedDiet(diet.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedDiet === diet.id
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200/70'
              }`}
            >
              {diet.label}
            </button>
          ))}
        </div>
      </div>

      {/* Generated Recipes Grid */}
      {isGenerating ? (
        <div className="py-20 text-center rounded-3xl bg-white border border-stone-200/80 shadow-xs">
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-4 animate-bounce">
            <ChefHat className="w-8 h-8" />
          </div>
          <h3 className="font-extrabold text-stone-900 text-lg mb-1">
            {t.recipes.generating}
          </h3>
          <p className="text-xs text-stone-600 max-w-sm mx-auto">
            Notre chef IA analyse les dates de péremption de votre stock pour concevoir des associations savoureuses.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {recipes.map((recipe) => {
            const isSpeaking = activeSpeechRecipeId === recipe.id;
            const completed = completedSteps[recipe.id] || [];

            return (
              <div
                key={recipe.id}
                className="p-6 sm:p-8 rounded-3xl bg-white border border-stone-200/80 shadow-md hover:border-emerald-300 transition-all space-y-6"
              >
                {/* Recipe Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                        {recipe.ecoScore}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-md bg-stone-100 text-stone-700 text-[11px] font-semibold capitalize">
                        Difficulté : {recipe.difficulty}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-800 text-[11px] font-bold">
                        ~ +{recipe.estimatedSavings.toFixed(2)} € sauvés
                      </span>
                    </div>

                    <h3 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight">
                      {recipe.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-stone-600 mt-1 font-medium">
                      {recipe.subtitle}
                    </p>
                  </div>

                  {/* Audio Read-Aloud & Cooked Button */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => toggleSpeech(recipe)}
                      className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                        isSpeaking
                          ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'
                          : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                      }`}
                      title={isSpeaking ? t.recipes.stopAudio : t.recipes.readAloud}
                    >
                      {isSpeaking ? (
                        <>
                          <VolumeX className="w-4 h-4 text-rose-600" />
                          <span>{t.recipes.stopAudio}</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-4 h-4 text-stone-600" />
                          <span>{t.recipes.readAloud}</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        celebrate();
                        showToast(
                          language === 'ar'
                            ? 'مبروك! قمت بطهي هذه الوجبة وإنقاذ مكوناتك بنجاح 🌱'
                            : 'Félicitations ! Vous avez cuisiné ce plat et évité le gaspillage 🌱'
                        );
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                      <span>{t.recipes.markCooked}</span>
                    </button>
                  </div>
                </div>

                {/* Timing & Servings info bar */}
                <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-stone-600 bg-[#FBF9F5] p-3 rounded-2xl border border-stone-200/60">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-emerald-600" />
                    <span>{t.recipes.prepTime} : {recipe.prepTimeMinutes} min</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-amber-600" />
                    <span>{t.recipes.cookTime} : {recipe.cookTimeMinutes} min</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-stone-600" />
                    <span>{recipe.servings} {t.recipes.servings}</span>
                  </div>
                </div>

                {/* Ingredients: Saved vs Pantry staples */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Saved Ingredients */}
                  <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-900 mb-2 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                      <span>{t.recipes.savedIngredients}</span>
                    </h4>
                    <ul className="space-y-1">
                      {recipe.savedIngredients.map((item, idx) => (
                        <li key={idx} className="text-xs font-bold text-emerald-950 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Staples needed */}
                  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-stone-700 mb-2">
                      {t.recipes.staplesNeeded}
                    </h4>
                    <ul className="space-y-1">
                      {recipe.additionalIngredients.map((item, idx) => (
                        <li key={idx} className="text-xs text-stone-700 flex items-center gap-2 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-stone-400"></span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Instructions Steps Checklist */}
                <div>
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-stone-700 mb-3">
                    {t.recipes.instructions}
                  </h4>
                  <div className="space-y-2">
                    {recipe.instructions.map((step, idx) => {
                      const isDone = completed.includes(idx);
                      return (
                        <div
                          key={idx}
                          onClick={() => toggleStep(recipe.id, idx)}
                          className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                            isDone
                              ? 'bg-emerald-50/50 border-emerald-200 text-stone-500 line-through'
                              : 'bg-white border-stone-200 hover:border-emerald-300 text-stone-800'
                          }`}
                        >
                          <div
                            className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold transition-colors ${
                              isDone
                                ? 'bg-emerald-600 text-white'
                                : 'bg-stone-100 text-stone-700 border border-stone-300'
                            }`}
                          >
                            {isDone ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                          </div>
                          <p className="text-xs sm:text-sm leading-relaxed font-medium">
                            {step}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Chef Tip */}
                {recipe.chefTip && (
                  <div className="p-3.5 rounded-2xl bg-[#F6F2EA] border border-[#E9E2D5] text-xs text-stone-800 flex items-start gap-2">
                    <ChefHat className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-emerald-900 block font-bold mb-0.5">
                        Astuce du Chef :
                      </strong>
                      <span>{recipe.chefTip}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
