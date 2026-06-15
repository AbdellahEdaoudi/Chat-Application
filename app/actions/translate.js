"use server";

export async function translateText(text, targetLang) {
  if (!text || !targetLang) {
    return { error: 'Text and targetLang are required' };
  }
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
       throw new Error('Google Translate API error');
    }
    const data = await response.json();
    const translatedText = data[0].map(item => item[0]).join('');
    return { translatedText };
  } catch (error) {
    console.error('Translation error:', error);
    return { error: 'Translation failed' };
  }
}
