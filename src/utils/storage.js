//This will remember things between pages
//Submitted questionnaire answers go in a cookie that the browser sdeltes after an hour
//The last ZIP code entered/searched goes into the session's storage, which lasts until the browsers tab is closes for use in Q2

const ANSWERS_COOKIE = 'benefitsAnswers';
const SIXTY_MINUTES = 60 * 60;

export function saveAnswers(data) {
  const text = encodeURIComponent(JSON.stringify(data));
  document.cookie = ANSWERS_COOKIE + '=' + text + '; max-age=' + SIXTY_MINUTES + '; path=/; SameSite=Lax';
}

export function loadSavedAnswers() {
  // document.cookie is one line like "a=1; benefitsAnswers=...". Find our part.
  const cookies = document.cookie.split('; ');
  for (const cookie of cookies) {
    if (cookie.startsWith(ANSWERS_COOKIE + '=')) {
      try {
        return JSON.parse(decodeURIComponent(cookie.slice(ANSWERS_COOKIE.length + 1)));
      } catch {
        return null; // the cookie was damaged somehow, so treat it as missing
      }
    }
  }
  return null;
}

export function clearSavedAnswers() {
  document.cookie = ANSWERS_COOKIE + '=; max-age=0; path=/; SameSite=Lax';
}

export function rememberZip(zip) {
  try {
    sessionStorage.setItem('lastSearchedZip', zip);
  } catch {
    // storage blocked: Q2 just won't be filled in
  }
}

export function getRememberedZip() {
  try {
    return sessionStorage.getItem('lastSearchedZip') || '';
  } catch {
    return '';
  }
}
