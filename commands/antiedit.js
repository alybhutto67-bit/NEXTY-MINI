const fs = require('fs-extra');
const path = require('path');
const settings = require('../settings');

const CONFIG_PATH = path.join(__dirname, '../data/antiedit.json');
function readConfig() {
  try { return fs.readJsonSync(CONFIG_PATH); } catch { return { enabled: false }; }
}
function ownerJid(sock) {
  const configured = String(settings.ownerNumber || '').replace(/\D/g, '');
  const number = configured && !configured.includes('XXXXXXXX') ? configured : sock.user?.id?.split(':')[0];
  return number ? `${number}@s.whatsapp.net` : null;
}

async function antieditCommand(sock, chatId, msg, isOwner, args = []) {
  if (!isOwner) return sock.sendMessage(chatId, { text: '❌ Owner-only command.' }, { quoted: msg });
  const action = (args[0] || '').toLowerCase();
  const config = readConfig();
  if (!action || action === 'status') {
    return sock.sendMessage(chatId, { text: `✏️ *ANTI-EDIT*\n\nStatus: ${config.enabled ? '✅ ON' : '❌ OFF'}\n\nUse .antiedit on/off` }, { quoted: msg });
  }
  if (!['on', 'off'].includes(action)) return sock.sendMessage(chatId, { text: '❌ Use .antiedit on/off' }, { quoted: msg });
  config.enabled = action === 'on';
  fs.ensureDirSync(path.dirname(CONFIG_PATH));
  fs.writeJsonSync(CONFIG_PATH, config, { spaces: 2 });
  return sock.sendMessage(chatId, { text: `✅ Anti-edit ${config.enabled ? 'enabled' : 'disabled'}. Reports will arrive in the owner personal inbox.` }, { quoted: msg });
}

async function handleEditedMessage(sock, update, messageLogs = {}) {
  try {
    if (!readConfig().enabled || !update?.key?.id) return;
    const edited = update.update?.message?.editedMessage || update.update?.editedMessage || update.message?.editedMessage;
    if (!edited) return;
    const owner = ownerJid(sock);
    if (!owner) return;
    const oldText = messageLogs[update.key.id]?.text || '[previous content unavailable]';
    const newText = edited.message?.conversation || edited.message?.extendedTextMessage?.text || edited.conversation || edited.extendedTextMessage?.text || '[edited media/message]';
    const sender = update.key.participant || update.key.remoteJid || 'unknown';
    const report = `✏️ *ANTI-EDIT REPORT*\n\n👤 Sender: @${sender.split('@')[0]}\n📝 Before: ${oldText}\n🆕 After: ${newText}\n🕒 Time: ${new Date().toLocaleString()}`;
    await sock.sendMessage(owner, { text: report, mentions: [sender] });
  } catch (error) {
    console.error('[antiedit]', error.message);
  }
}

module.exports = antieditCommand;
module.exports.handleEditedMessage = handleEditedMessage;
