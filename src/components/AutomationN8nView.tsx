import React, { useState } from 'react';
import {
  Workflow,
  Send,
  CheckCircle2,
  AlertTriangle,
  Download,
  Copy,
  Clock,
  ExternalLink,
  ShieldCheck,
  Bell,
  Mail,
  Smartphone,
  Code2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function AutomationN8nView() {
  const { t, userSettings, updateSettings, testN8nWebhook, automationLogs, showToast, celebrate } = useApp();

  const [webhookUrl, setWebhookUrl] = useState(userSettings?.n8nWebhookUrl || 'https://n8n.webhook.office/ecochef-alerts');
  const [alertDays, setAlertDays] = useState(userSettings?.alertDaysBefore || 3);
  const [isTesting, setIsTesting] = useState(false);
  const [lastTestResult, setLastTestResult] = useState<any>(null);
  const [isCopied, setIsCopied] = useState(false);

  // Ready-to-use n8n workflow blueprint
  const n8nWorkflowTemplate = {
    name: 'EcoChef AI - Alerte Péremption Quotidienne',
    nodes: [
      {
        parameters: {
          httpMethod: 'POST',
          path: 'ecochef-alerts',
          options: {},
        },
        id: '1',
        name: 'EcoChef Webhook Trigger',
        type: 'n8n-nodes-base.webhook',
        typeVersion: 1,
        position: [250, 300],
      },
      {
        parameters: {
          conditions: {
            number: [
              {
                value1: '={{ $json.expiringCount }}',
                operation: 'larger',
                value2: 0,
              },
            ],
          },
        },
        id: '2',
        name: 'Aliments Urgents ?',
        type: 'n8n-nodes-base.if',
        typeVersion: 1,
        position: [480, 300],
      },
      {
        parameters: {
          chatId: '@ecochef_family_bot',
          text: '🌱 Alerte EcoChef AI : {{ $json.expiringCount }} aliment(s) expirent bientôt dans votre réfrigérateur !\nConsultez l\'application pour cuisiner la recette anti-gaspi suggérée.',
        },
        id: '3',
        name: 'Notification Telegram / WhatsApp',
        type: 'n8n-nodes-base.telegram',
        typeVersion: 1,
        position: [700, 200],
      },
      {
        parameters: {
          toEmail: '={{ $json.user.email }}',
          subject: 'EcoChef AI : Sauvez vos aliments du jour !',
          text: 'Bonjour {{ $json.user.name }},\n\nVoici vos aliments à consommer en urgence pour éviter tout gaspillage.',
        },
        id: '4',
        name: 'Email Récapitulatif',
        type: 'n8n-nodes-base.emailSend',
        typeVersion: 2,
        position: [700, 400],
      },
    ],
    connections: {
      'EcoChef Webhook Trigger': {
        main: [[{ node: 'Aliments Urgents ?', type: 'main', index: 0 }]],
      },
      'Aliments Urgents ?': {
        main: [
          [{ node: 'Notification Telegram / WhatsApp', type: 'main', index: 0 }],
          [{ node: 'Email Récapitulatif', type: 'main', index: 0 }],
        ],
      },
    },
  };

  const handleSaveSettings = async () => {
    await updateSettings({
      n8nWebhookUrl: webhookUrl.trim(),
      alertDaysBefore: Number(alertDays),
    });
  };

  const handleTestWebhook = async () => {
    setIsTesting(true);
    setLastTestResult(null);
    try {
      const res = await testN8nWebhook(webhookUrl.trim());
      setLastTestResult(res);
      if (res.success) {
        celebrate();
        showToast('Webhook n8n déclenché avec succès !');
      }
    } catch {
      showToast('Erreur lors du test', 'error');
    } finally {
      setIsTesting(false);
    }
  };

  const copyWorkflowJson = () => {
    navigator.clipboard.writeText(JSON.stringify(n8nWorkflowTemplate, null, 2));
    setIsCopied(true);
    showToast('Modèle JSON n8n copié dans le presse-papier !');
    setTimeout(() => setIsCopied(false), 3000);
  };

  const downloadWorkflowJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(n8nWorkflowTemplate, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'ecochef_n8n_workflow.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-2">
            <Workflow className="w-3.5 h-3.5 text-emerald-600" />
            <span>Automatisation & Webhooks n8n</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            {t.automation.title}
          </h2>
          <p className="text-stone-700 text-xs sm:text-sm mt-0.5 max-w-2xl">
            {t.automation.subtitle}
          </p>
        </div>

        <button
          onClick={downloadWorkflowJson}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-stone-300 hover:bg-stone-50 text-stone-800 text-xs sm:text-sm font-bold shadow-xs transition-colors cursor-pointer whitespace-nowrap"
        >
          <Download className="w-4 h-4 text-emerald-700" />
          <span>{t.automation.downloadWorkflow}</span>
        </button>
      </div>

      {/* Main Settings Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-stone-200/80 shadow-md space-y-6">
        {/* Webhook URL Input & Test Action */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center justify-between">
            <span>{t.automation.webhookUrl}</span>
            <span className="text-[11px] font-normal text-stone-600">
              Compatible n8n Cloud ou Self-Hosted
            </span>
          </label>
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <input
              type="url"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://n8n.votredomaine.com/webhook/ecochef-alerts"
              className="flex-1 w-full px-4 py-3 rounded-2xl border border-stone-300 text-stone-900 text-xs sm:text-sm bg-[#FBF9F5]/70 focus:ring-2 focus:ring-emerald-500 font-mono"
            />

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handleSaveSettings}
                className="px-4 py-3 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition-colors cursor-pointer"
              >
                {t.common.save}
              </button>

              <button
                onClick={handleTestWebhook}
                disabled={isTesting}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-extrabold shadow-md shadow-emerald-800/20 transition-all cursor-pointer whitespace-nowrap disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{isTesting ? t.automation.testing : t.automation.testWebhook}</span>
              </button>
            </div>
          </div>
          <p className="text-[11px] text-stone-600">
            {t.automation.webhookHelp}
          </p>
        </div>

        {/* Configuration: Threshold & Channels */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-stone-100">
          <div className="p-4 rounded-2xl bg-[#FBF9F5] border border-stone-200/70 space-y-2">
            <span className="text-xs font-bold text-stone-800 block">
              {t.automation.daysBefore}
            </span>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 5].map((d) => (
                <button
                  key={d}
                  onClick={() => setAlertDays(d)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    alertDays === d
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  {d} jours
                </button>
              ))}
            </div>
            <p className="text-[11px] text-stone-600">
              Déclenche l'alerte dès qu'un produit a une durée restante ≤ à cette valeur.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#FBF9F5] border border-stone-200/70 space-y-2">
            <span className="text-xs font-bold text-stone-800 block">
              {t.automation.channelsTitle}
            </span>
            <div className="space-y-1.5 text-xs text-stone-700">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded text-emerald-600" />
                <Mail className="w-3.5 h-3.5 text-stone-600" />
                <span>{t.automation.channelEmail}</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded text-emerald-600" />
                <Workflow className="w-3.5 h-3.5 text-emerald-700" />
                <span>{t.automation.channelN8n}</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded text-emerald-600" />
                <Smartphone className="w-3.5 h-3.5 text-stone-600" />
                <span>{t.automation.channelPush}</span>
              </label>
            </div>
          </div>
        </div>

        {/* Live Payload Inspector (When Tested) */}
        {lastTestResult && (
          <div className="p-4 rounded-2xl bg-stone-900 text-emerald-400 font-mono text-xs space-y-2 animate-in fade-in">
            <div className="flex items-center justify-between text-stone-400 border-b border-stone-800 pb-2">
              <span className="flex items-center gap-1.5 font-sans font-bold text-white text-xs">
                <Code2 className="w-4 h-4 text-emerald-400" />
                Payload JSON envoyé à n8n :
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 text-[10px] border border-emerald-800">
                Statut : {lastTestResult.log?.status || 'OK'}
              </span>
            </div>
            <pre className="max-h-56 overflow-y-auto whitespace-pre-wrap">
              {JSON.stringify(lastTestResult.payloadSent, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Execution Logs Table */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-stone-200/80 shadow-md space-y-4">
        <h3 className="font-extrabold text-stone-900 text-base flex items-center gap-2">
          <Clock className="w-4 h-4 text-emerald-700" />
          <span>{t.automation.logsTitle}</span>
        </h3>

        {automationLogs.length === 0 ? (
          <p className="text-xs text-stone-600">{t.automation.noLogs}</p>
        ) : (
          <div className="space-y-2.5">
            {automationLogs.map((log: any) => (
              <div
                key={log.id}
                className="p-3.5 rounded-2xl bg-[#FBF9F5] border border-stone-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                        log.status === 'success'
                          ? 'bg-emerald-100 text-emerald-800'
                          : log.status === 'simulated'
                          ? 'bg-sky-100 text-sky-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {log.status === 'success' ? '200 OK' : log.status === 'simulated' ? 'SIMULÉ' : 'ERREUR'}
                    </span>
                    <strong className="text-stone-900">{log.event}</strong>
                  </div>
                  <p className="text-stone-600 leading-snug">{log.summary}</p>
                </div>

                <div className="text-[11px] text-stone-600 sm:text-right shrink-0">
                  <span>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  <span className="block text-[10px] text-stone-600">{new Date(log.timestamp).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* n8n Workflow Template Viewer */}
      <div className="p-6 rounded-3xl bg-[#F6F2EA] border border-[#E9E2D5] space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-extrabold text-xs uppercase tracking-wider text-stone-800 flex items-center gap-1.5">
            <Workflow className="w-4 h-4 text-emerald-700" />
            <span>{t.automation.workflowModalTitle}</span>
          </h4>
          <button
            onClick={copyWorkflowJson}
            className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{isCopied ? 'Copié !' : 'Copier JSON n8n'}</span>
          </button>
        </div>
        <p className="text-xs text-stone-700 leading-relaxed">
          Importez ce scénario dans n8n (Menu <strong>Workflows &gt; Import from File / URL</strong>). Il configure automatiquement le déclencheur Webhook, le nœud de vérification des dates de péremption, et les canaux de notification Telegram / WhatsApp et Email.
        </p>
      </div>
    </div>
  );
}
