/** 复制文本到剪贴板，file:// 等非安全上下文走 execCommand 回退。 */
export function copyText(text: string, msg = '已复制') {
  const done = () => toast(msg);
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(done).catch(() => fallback(text, done));
  } else {
    fallback(text, done);
  }
}

function fallback(text: string, done: () => void) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.cssText = 'position:fixed;opacity:0';
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand('copy');
    done();
  } catch {
    toast('复制失败，请手动复制');
  }
  ta.remove();
}

export function toast(msg: string) {
  window.dispatchEvent(new CustomEvent('app-toast', { detail: msg }));
}
