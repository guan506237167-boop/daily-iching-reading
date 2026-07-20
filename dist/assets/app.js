const hexagrams = [
  "1 Qian / Creative", "2 Kun / Receptive", "3 Zhun / Difficulty at the Beginning", "4 Meng / Youthful Folly",
  "5 Xu / Waiting", "6 Song / Conflict", "7 Shi / Army", "8 Bi / Holding Together",
  "9 Xiao Chu / Small Taming", "10 Lu / Treading", "11 Tai / Peace", "12 Pi / Standstill",
  "13 Tong Ren / Fellowship", "14 Da You / Great Possession", "15 Qian / Modesty", "16 Yu / Enthusiasm",
  "17 Sui / Following", "18 Gu / Work on What Has Been Spoiled", "19 Lin / Approach", "20 Guan / Contemplation",
  "21 Shi He / Biting Through", "22 Bi / Grace", "23 Bo / Splitting Apart", "24 Fu / Return",
  "25 Wu Wang / Innocence", "26 Da Chu / Great Taming", "27 Yi / Nourishment", "28 Da Guo / Great Exceeding",
  "29 Kan / Water", "30 Li / Fire", "31 Xian / Influence", "32 Heng / Duration",
  "33 Dun / Retreat", "34 Da Zhuang / Great Power", "35 Jin / Progress", "36 Ming Yi / Darkening of the Light",
  "37 Jia Ren / Family", "38 Kui / Opposition", "39 Jian / Obstruction", "40 Jie / Release",
  "41 Sun / Decrease", "42 Yi / Increase", "43 Guai / Breakthrough", "44 Gou / Coming to Meet",
  "45 Cui / Gathering", "46 Sheng / Pushing Upward", "47 Kun / Oppression", "48 Jing / Well",
  "49 Ge / Revolution", "50 Ding / Cauldron", "51 Zhen / Thunder", "52 Gen / Mountain",
  "53 Jian / Gradual Progress", "54 Gui Mei / Marrying Maiden", "55 Feng / Abundance", "56 Lu / Traveler",
  "57 Xun / Wind", "58 Dui / Lake", "59 Huan / Dispersion", "60 Jie / Limitation",
  "61 Zhong Fu / Inner Truth", "62 Xiao Guo / Small Exceeding", "63 Ji Ji / After Completion", "64 Wei Ji / Before Completion"
];
const lineText = {6:"old yin, changing",7:"young yang",8:"young yin",9:"old yang, changing"};
function hashText(value){let h=2166136261; for(const ch of String(value)){h^=ch.charCodeAt(0); h=Math.imul(h,16777619);} return h>>>0;}
function getToolRoot(target){return target?.closest('.hero-tool-card, .container') || document;}
function castIChing(event){
  const root = getToolRoot(event?.currentTarget);
  const question = (root.querySelector('#question')?.value || 'A practical question').trim();
  const seed = hashText(question.toLowerCase());
  const lines = Array.from({length:6},(_,i)=>[6,7,8,9][(seed >>> (i*2)) & 3]);
  const primaryIndex = lines.reduce((sum,line,i)=>sum + ((line===7||line===9)?1:0) * (2**i),0) % 64;
  const changed = lines.map((line,i)=>line===6||line===9 ? i+1 : null).filter(Boolean);
  const relatingLines = lines.map(line=>line===6?7:line===9?8:line);
  const relatingIndex = relatingLines.reduce((sum,line,i)=>sum + ((line===7||line===9)?1:0) * (2**i),0) % 64;
  const focus = changed.length ? `Changing lines: ${changed.join(', ')}.` : 'No changing line in this starter reading.';
  const result = root.querySelector('#result');
  if (!result) return;
  const linePattern = lines.map((line,i)=>`line ${i+1}: ${lineText[line]}`).join('; ');
  result.dataset.question = question;
  result.dataset.primaryHexagram = hexagrams[primaryIndex];
  result.dataset.changingLines = changed.length ? changed.join(', ') : 'none';
  result.dataset.relatingHexagram = hexagrams[relatingIndex];
  result.dataset.linePattern = linePattern;
  result.dataset.readingReady = 'true';
  result.innerHTML = `<h3>${hexagrams[primaryIndex]}</h3><p><strong>Question:</strong> ${question}</p><p><strong>${focus}</strong> Relating pattern: ${hexagrams[relatingIndex]}.</p><p><strong>Line pattern:</strong> ${linePattern}.</p><p>Use this as a structured cultural reflection note. It is not professional, medical, legal, or financial advice.</p>`;
}
document.addEventListener('DOMContentLoaded',()=>{const b=document.querySelector('[data-cast]'); if(b)b.addEventListener('click',castIChing);});

