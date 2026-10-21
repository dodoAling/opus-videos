/** 复制文本到剪贴板，file:// 等非安全上下文走 execCommand 回退。 */
export function copyText(text: string, msg: string, failMsg: string) {
  const done = () => toast(msg);
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(done).catch(() => fallback(text, done, failMsg));
  } else {
    fallback(text, done, failMsg);
  }
}

function fallback(text: string, done: () => void, failMsg: string) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.cssText = 'position:fixed;opacity:0';
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand('copy');
    done();
  } catch {
    toast(failMsg);
  }
  ta.remove();
}

export function toast(msg: string) {
  window.dispatchEvent(new CustomEvent('app-toast', { detail: msg }));
}
