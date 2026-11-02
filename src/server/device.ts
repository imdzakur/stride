const MOBILE_UA = /Android|iPhone|iPad|Mobile/;

export function isMobileRequest(headers: Headers): boolean {
  if (headers.get('sec-ch-ua-mobile') === '?1') return true;
  return MOBILE_UA.test(headers.get('user-agent') ?? '');
}
