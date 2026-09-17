const fs = require('fs-extra');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const FILES = {
  antidelete: path.join(DATA_DIR, 'antidelete.json'),
  antiedit: path.join(DATA_DIR, 'antiedit.json'),
  autoread: path.join(DATA_DIR, 'autoread.json')
};

function readFlag(file) {
  try { return Boolean(fs.readJsonSync(file).enabled); } catch { return false; }
}
function writeFlag(file, enabled) {
  fs.ensureDirSync(DATA_DIR);
  fs.writeJsonSync(file, { enabled }, { spaces: 2 });
}
function ensureUser(botData, userId) {
  if (!botData.statusSettings[userId]) botData.statusSettings[userId] = {};
  return botData.statusSettings[userId];
}
function mark(value) { return value ? '✅ ON' : '❌ OFF'; }

module.exports = async function settingsCommand(sock, from, msg, isOwner, botData, saveBotData, userId, args = [], session) {
  if (!isOwner) return sock.sendMessage(from, { text: '❌ Owner-only command.' }, { quoted: msg });
  const state = ensureUser(botData, userId);
  const feature = (args[0] || '').toLowerCase();
  const action = (args[1] || '').toLowerCase();
  const validActions = ['on', 'off'];

  if (!feature || feature === 'status' || feature === 'help') {
    const text = `╭━━━〔 ⚙️ NEXTY SETTINGS 〕━━━╮\n` +
      `┃ Public Mode   : ${mark(session?.isPublic)}\n` +
      `┃ Anti-Delete   : ${mark(readFlag(FILES.antidelete))}\n` +
      `┃ Anti-Edit     : ${mark(readFlag(FILES.antiedit))}\n` +
      `┃ Anti-Status   : ${mark(state.antiStatus)}\n` +
      `┃ Auto-Read     : ${mark(readFlag(FILES.autoread))}\n` +
      `┃ Auto-View     : ${mark(state.autoSeen)}\n` +
      `┃ Auto-Like     : ${mark(state.autoLike)}\n` +
      `┃ Auto-Download : ${mark(state.autoDownload)}\n` +
      `╰━━━━━━━━━━━━━━━━━━━━━━╯\n\n` +
      `Direct owner commands:\n` +
      `.public / .private\n` +
      `.antidelete on/off\n` +
      `.antiedit on/off\n` +
      `.antistatus on/off\n` +
      `.autoread on/off\n` +
      `.autoview on/off\n` +
      `.autolike on/off\n` +
      `.autodownload on/off\n\n` +
      `This menu: .settings`;
    return sock.sendMessage(from, { text }, { quoted: msg });
  }

  if (!validActions.includes(action)) {
    return sock.sendMessage(from, { text: '❌ Use `.settings <feature> on/off` or `.settings status`.' }, { quoted: msg });
  }
  const enabled = action === 'on';
  const simpleMap = {
    public: 'isPublic',
    antistatus: 'antiStatus',
    autoview: 'autoSeen',
    autolike: 'autoLike',
    autodownload: 'autoDownload',
    autoreact: 'autoReact'
  };

  if (feature === 'public') {
    state.isPublic = enabled;
    if (session) session.isPublic = enabled;
  } else if (feature === 'antistatus') {
    if (!botData.antiStatusGroups) botData.antiStatusGroups = {};
    botData.antiStatusGroups[from] = enabled;
    state.antiStatus = enabled;
  } else if (simpleMap[feature]) {
    state[simpleMap[feature]] = enabled;
    if (feature === 'autoreact' && session) session.autoReact = enabled;
  } else if (FILES[feature]) {
    writeFlag(FILES[feature], enabled);
  } else {
    return sock.sendMessage(from, { text: `❌ Unknown setting: ${feature}\nUse .settings status` }, { quoted: msg });
  }

  saveBotData();
  return sock.sendMessage(from, { text: `✅ ${feature} has been ${enabled ? 'enabled' : 'disabled'}.\nUse .settings status to view all settings.` }, { quoted: msg });
};
