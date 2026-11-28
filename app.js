/* FC Ultimate Club — gameplay core v0.2 */
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const fmt=n=>Number(n||0).toLocaleString('ru-RU');
const STORE_KEY='fcuc_winter_save_v2';
const FCUC_HAD_PREVIOUS_SAVE=!!localStorage.getItem(STORE_KEY)||!!localStorage.getItem('fcuc_winter_save_v5');
const defaultPlayers=[
 {id:'p01',name:'Алексей Морозов',pos:'GK',ovr:58,club:'Frost United',price:0},
 {id:'p02',name:'Илья Волков',pos:'LB',ovr:57,club:'Frost United',price:0},
 {id:'p03',name:'Максим Орлов',pos:'CB',ovr:60,club:'Frost United',price:0},
 {id:'p04',name:'Даниил Ковалёв',pos:'CB',ovr:59,club:'Frost United',price:0},
 {id:'p05',name:'Артём Соколов',pos:'RB',ovr:56,club:'Frost United',price:0},
 {id:'p06',name:'Егор Лебедев',pos:'CM',ovr:60,club:'Frost United',price:0},
 {id:'p07',name:'Никита Фёдоров',pos:'CM',ovr:58,club:'Frost United',price:0},
 {id:'p08',name:'Кирилл Павлов',pos:'CAM',ovr:59,club:'Frost United',price:0},
 {id:'p09',name:'Матвей Смирнов',pos:'LW',ovr:57,club:'Frost United',price:0},
 {id:'p10',name:'Тимур Андреев',pos:'ST',ovr:60,club:'Frost United',price:0},
 {id:'p11',name:'Роман Николаев',pos:'RW',ovr:56,club:'Frost United',price:0},
 {id:'p12',name:'Владислав Громов',pos:'ST',ovr:55,club:'Frost United',price:0},
 {id:'p13',name:'Павел Захаров',pos:'CM',ovr:54,club:'Frost United',price:0},
 {id:'p14',name:'Марк Васильев',pos:'LB',ovr:53,club:'Frost United',price:0},
 {id:'p15',name:'Денис Белый',pos:'CB',ovr:55,club:'Frost United',price:0},
 {id:'p16',name:'Антон Егоров',pos:'GK',ovr:52,club:'Frost United',price:0}
];
const marketSeed=[
 ['m01','Ламин Ямаль','RW',88,1250000],['m02','Джуд Беллингем','CAM',90,1850000],['m03','Эрлинг Холанд','ST',91,2200000],['m04','Педри','CM',87,1050000],['m05','Вильям Салиба','CB',86,850000],['m06','Джанлуиджи Доннарумма','GK',87,950000],['m07','Флориан Вирц','CAM',89,1650000],['m08','Букаё Сака','RW',89,1700000],['m09','Деклан Райс','CDM',87,1100000],['m10','Рональд Араухо','CB',86,820000],['m11','Винисиус Жуниор','LW',91,2300000],['m12','Хулиан Альварес','ST',86,880000]
].map(x=>({id:x[0],name:x[1],pos:x[2],ovr:x[3],price:x[4],club:'Трансферный рынок'}));
const weeklyDefs=[
 {title:'Сыграй 3 матча',desc:'Заверши три матча',stat:'matches',goal:3,reward:{coins:25000}},
 {title:'Забей 5 голов',desc:'Забей пять голов в матчах',stat:'goals',goal:5,reward:{gems:150}},
 {title:'Открой 2 набора',desc:'Открой два набора в магазине',stat:'packs',goal:2,reward:{eventCoins:100}},
 {title:'Выиграй 5 матчей',desc:'Одержи пять побед',stat:'wins',goal:5,reward:{coins:50000}},
 {title:'Подпиши игрока',desc:'Купи футболиста на рынке',stat:'buys',goal:1,reward:{gems:200}},
 {title:'Набери 500 очков события',desc:'Заработай очки Winter Wunderkind',stat:'eventPoints',goal:500,reward:{eventCoins:150}}
];
const eventDefs=[
 {title:'Сыграй матч события',desc:'Заверши один матч',stat:'matches',goal:1,reward:50},
 {title:'Забей гол',desc:'Забей один гол',stat:'goals',goal:1,reward:75},
 {title:'Одержи победу',desc:'Выиграй один матч',stat:'wins',goal:1,reward:100}
];
const passRewards=[
 {need:100,label:'25 000 монет',type:'coins',amount:25000},{need:250,label:'Набор новичка',type:'pack',amount:1},{need:500,label:'100 самоцветов',type:'gems',amount:100},{need:800,label:'50 000 монет',type:'coins',amount:50000},{need:1200,label:'Зимний набор',type:'pack',amount:1},{need:1700,label:'250 самоцветов',type:'gems',amount:250},{need:2300,label:'Игрок Winter 70–80',type:'eventPlayer',amount:1},{need:3000,label:'100 000 монет',type:'coins',amount:100000}];
let state=loadState();
function freshState(){return {gems:2500,coins:250000,eventCoins:0,eventPoints:0,players:defaultPlayers.map(p=>({...p})),market:marketSeed.map(p=>({...p})),startingXI:defaultPlayers.slice(0,11).map(p=>p.id),bench:defaultPlayers.slice(11).map(p=>p.id),formation:'4-3-3',style:'Баланс',weeklyProgress:{matches:0,goals:0,packs:0,wins:0,buys:0,eventPoints:0},eventProgress:{matches:0,goals:0,wins:0},weeklyClaimed:[],eventClaimed:[],passClaimed:[],seasonXP:0,stats:{matches:0,wins:0,goals:0,packs:0,buys:0},history:[],weekStart:new Date().toISOString().slice(0,10),clubLevel:1};}
function loadState(){try{let raw=localStorage.getItem(STORE_KEY);if(raw){let s=JSON.parse(raw);return {...freshState(),...s};}}catch(e){console.warn('Save read error',e);}return freshState();}
function save(){try{localStorage.setItem(STORE_KEY,JSON.stringify(state));let el=$('#saveStatus');if(el)el.textContent='СОХРАНЕНО';}catch(e){toast('Не удалось сохранить: память браузера недоступна');}}
function toast(t){let el=$('#toast');if(!el)return;el.textContent=t;el.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove('show'),2300);}
function modal(title,txt,extra=''){let el=$('#modal');$('#modalTitle').textContent=title;$('#modalText').textContent=txt;let body=$('#modalExtra');if(body)body.innerHTML=extra;el.classList.add('show');}
function closeModal(){$('#modal').classList.remove('show');}
function updateWallet(){['gems','coins','eventCoins'].forEach(k=>{let e=$('#'+k);if(e)e.textContent=fmt(state[k]);});if($('#marketBalance'))$('#marketBalance').textContent=fmt(state.coins);if($('#storeGems'))$('#storeGems').textContent=fmt(state.gems)+' ◆';if($('#points'))$('#points').textContent=fmt(state.eventPoints);if($('#passPoints'))$('#passPoints').textContent=fmt(state.seasonXP);if($('#clubLevel'))$('#clubLevel').textContent=state.clubLevel;}
function navigate(page){$$('.page').forEach(p=>p.classList.toggle('active',p.id===page));$$('.nav').forEach(b=>b.classList.toggle('active',b.dataset.page===page));let names={home:'ГЛАВНАЯ',squad:'СОСТАВ',match:'МАТЧИ',event:'СОБЫТИЕ',quests:'ЗАДАНИЯ',market:'РЫНОК',store:'МАГАЗИН',pass:'ЗИМНИЙ ПАСС'};if($('#crumb'))$('#crumb').textContent=names[page]||'КЛУБ';if(page==='squad')drawSquad();if(page==='market')renderMarket();if(page==='match')renderMatchSetup();if(page==='pass')renderPass();}
$$('.nav').forEach(b=>b.addEventListener('click',()=>navigate(b.dataset.page)));$$('[data-go]').forEach(b=>b.addEventListener('click',()=>navigate(b.dataset.go)));$('#modalClose')?.addEventListener('click',closeModal);$('#modalOk')?.addEventListener('click',closeModal);
function playerById(id){return state.players.find(p=>p.id===id)||state.market.find(p=>p.id===id)||{name:'Свободный слот',pos:'—',ovr:50};}
function positionsFor(f){let rows={'4-3-3':[[50,91],[15,74],[38,78],[62,78],[85,74],[30,53],[50,59],[70,53],[18,25],[50,15],[82,25]],'4-2-3-1':[[50,91],[15,74],[38,78],[62,78],[85,74],[37,62],[63,62],[50,43],[18,27],[82,27],[50,14]],'4-4-2':[[50,91],[15,74],[38,78],[62,78],[85,74],[15,49],[38,54],[62,54],[85,49],[37,20],[63,20]],'3-5-2':[[50,91],[25,76],[50,80],[75,76],[12,53],[34,57],[50,48],[66,57],[88,53],[36,20],[64,20]]};return rows[f]||rows['4-3-3'];}
function drawSquad(){let pitch=$('#pitch');if(!pitch)return;pitch.querySelectorAll('.player').forEach(x=>x.remove());let pos=positionsFor(state.formation);state.startingXI.forEach((id,i)=>{let p=playerById(id),xy=pos[i];let el=document.createElement('button');el.className='player';el.type='button';el.style.left=xy[0]+'%';el.style.top=xy[1]+'%';el.innerHTML=`<i>${p.ovr}</i><small>${escapeHTML(p.name.split(' ').slice(-1)[0])}</small>`;el.title=p.name+' · '+p.pos+' · '+p.ovr;el.addEventListener('click',()=>selectSquadPlayer(i));pitch.append(el);});if($('#formationLabel'))$('#formationLabel').textContent=state.formation;let bench=$('#benchList');if(bench)bench.innerHTML=state.bench.map(id=>{let p=playerById(id);return `<button class="bench-player" data-bench="${id}"><b>${p.ovr}</b> ${escapeHTML(p.pos)} · ${escapeHTML(p.name)}</button>`;}).join('')||'<span>Запасных пока нет</span>';let avg=Math.round(state.startingXI.reduce((n,id)=>n+playerById(id).ovr,0)/Math.max(1,state.startingXI.length));if($('#squadOVR'))$('#squadOVR').textContent=avg;}
function selectSquadPlayer(index){let current=playerById(state.startingXI[index]);let options=state.bench.map(id=>{let p=playerById(id);return `<option value="${id}">${escapeHTML(p.name)} · ${p.pos} · ${p.ovr}</option>`}).join('');modal('ЗАМЕНА В СОСТАВЕ',`Выбран: ${current.name}. Выбери игрока из запаса для обмена.`, `<select id="squadSwapSelect" class="modal-select">${options}</select><button class="primary full" id="confirmSquadSwap" ${state.bench.length?'':'disabled'}>ЗАМЕНИТЬ ИГРОКА</button>`);$('#confirmSquadSwap')?.addEventListener('click',()=>{let id=$('#squadSwapSelect')?.value;if(!id)return;let ix=state.bench.indexOf(id);state.bench[ix]=state.startingXI[index];state.startingXI[index]=id;save();drawSquad();closeModal();toast('Состав обновлён');});}
$('#formation')?.addEventListener('change',e=>{state.formation=e.target.value;save();drawSquad();});$$('.styles button').forEach(b=>b.addEventListener('click',()=>{state.style=b.textContent;$$('.styles button').forEach(x=>x.classList.toggle('selected',x===b));save();toast('Стиль игры: '+state.style);}));$('#subs')?.addEventListener('click',()=>{modal('УПРАВЛЕНИЕ СОСТАВОМ','Нажми на футболиста на поле, чтобы заменить его игроком из запаса.');});
function rewardText(r){return Object.entries(r).map(([k,v])=>`+${fmt(v)} ${{coins:'монет',gems:'самоцветов',eventCoins:'зимних самоцветов'}[k]||k}`).join(' ');}
function renderQuests(target,defs,claimed,progress,event=false){let el=$(target);if(!el)return;el.innerHTML=defs.map((q,i)=>{let done=(progress[q.stat]||0)>=q.goal,got=claimed.includes(i);return `<article class="quest"><div class="quest-icon">${event?'❄':'✦'}</div><div class="quest-info"><b>${q.title}</b><small>${q.desc} · ${Math.min(progress[q.stat]||0,q.goal)}/${q.goal} · ${got?'Награда получена':done?'Можно забрать':'В процессе'}</small><div class="bar"><i style="width:${Math.min(100,(progress[q.stat]||0)/q.goal*100)}%"></i></div></div><div class="quest-reward">${event?'+'+q.reward+' зимних':rewardText(q.reward)}</div><button class="claim" data-claim="${i}" data-event="${event}" ${!done||got?'disabled':''}>${got?'ПОЛУЧЕНО':done?'ЗАБРАТЬ':'ЗАКРЫТО'}</button></article>`;}).join('');}
function renderAll(){renderQuests('#weeklyQuests',weeklyDefs,state.weeklyClaimed,state.weeklyProgress);renderQuests('#eventQuests',eventDefs,state.eventClaimed,state.eventProgress,true);if($('#weekCount'))$('#weekCount').textContent=state.weeklyClaimed.length+'/'+weeklyDefs.length;if($('#weekBar'))$('#weekBar').style.width=(state.weeklyClaimed.length/weeklyDefs.length*100)+'%';let done=state.weeklyClaimed.length;if($('#weeklyHomeText'))$('#weeklyHomeText').textContent=done+' ИЗ '+weeklyDefs.length+' ПОЛУЧЕНО';if($('#weeklyHomeBar'))$('#weeklyHomeBar').style.width=(done/weeklyDefs.length*100)+'%';renderPass();}
document.addEventListener('click',e=>{let b=e.target.closest('[data-claim]');if(!b||b.disabled)return;let i=+b.dataset.claim,ev=b.dataset.event==='true',defs=ev?eventDefs:weeklyDefs,claimed=ev?state.eventClaimed:state.weeklyClaimed,progress=ev?state.eventProgress:state.weeklyProgress,q=defs[i];if(!q||claimed.includes(i)||(progress[q.stat]||0)<q.goal)return;claimed.push(i);if(ev){state.eventCoins+=q.reward;state.eventPoints+=q.reward;state.seasonXP+=q.reward;state.weeklyProgress.eventPoints+=q.reward;}else Object.entries(q.reward).forEach(([k,v])=>state[k]+=v);save();updateWallet();renderAll();toast('Задание выполнено — награда получена!');});
function addStat(key,n=1){state.stats[key]=(state.stats[key]||0)+n;state.weeklyProgress[key]=(state.weeklyProgress[key]||0)+n;state.eventProgress[key]=(state.eventProgress[key]||0)+n;if(key==='eventPoints'){state.seasonXP+=n;state.eventPoints+=n;}renderAll();save();}
function renderMarket(){let grid=$('#marketGrid');if(!grid)return;let filter=$('.filters button.selected')?.dataset.filter||'all';let q=($('#marketSearch')?.value||'').toLowerCase();let data=state.market.filter(p=>(filter==='all'||(filter==='GK'?p.pos==='GK':filter==='DEF'?['CB','LB','RB'].includes(p.pos):filter==='MID'?['CM','CAM','CDM'].includes(p.pos):['ST','LW','RW'].includes(p.pos)))&&(p.name+' '+p.pos).toLowerCase().includes(q));grid.innerHTML=data.map(p=>`<article class="market-card"><div class="card-art ${p.ovr>=89?'gold':p.ovr>=86?'purple':''}"><b>${p.ovr}</b><small>${p.pos} · PLAYER</small></div><div class="card-info"><b>${escapeHTML(p.name)}</b><small>${escapeHTML(p.club||'TRANSFER MARKET')} · ${p.pos}</small><div class="price-row"><span>● ${fmt(p.price)} </span><button data-buy="${p.id}">КУПИТЬ</button></div></div></article>`).join('')||'<p class="muted">Игроки не найдены. Измени фильтр или поисковый запрос.</p>';}
$$('.filters button').forEach(b=>b.addEventListener('click',()=>{$$('.filters button').forEach(x=>x.classList.toggle('selected',x===b));renderMarket();}));$('#marketSearch')?.addEventListener('input',renderMarket);
document.addEventListener('click',e=>{let b=e.target.closest('[data-buy]');if(!b)return;let p=state.market.find(x=>x.id===b.dataset.buy);if(!p)return;if(state.coins<p.price){toast('Недостаточно монет');return;}state.coins-=p.price;state.players.push({...p,id:'owned_'+p.id+'_'+Date.now()});state.bench.push(state.players[state.players.length-1].id);state.market=state.market.filter(x=>x.id!==p.id);addStat('buys');updateWallet();renderMarket();drawSquad();modal('ТРАНСФЕР ЗАВЕРШЁН',`${p.name} (${p.ovr}) подписан и добавлен в запас. Списано ${fmt(p.price)} монет.`);});
function revealPlayer(pool='pack'){let candidates=pool==='event'?Array.from({length:8},(_,i)=>({id:'wonder_'+i,name:['Ноа Винтер','Лео Фрост','Элиас Норд','Микаэль Сноу','Тео Блум','Лука Айс','Адам Бореаль','Эмиль Кристал'][i],pos:['ST','LW','CM','CAM','CB','RW','GK','CM'][i],ovr:70+Math.floor(Math.random()*11),club:'WINTER WUNDERKIND',price:0})):state.market.filter(p=>p.ovr>=80);let p={...candidates[Math.floor(Math.random()*candidates.length)]};p.id='card_'+Date.now()+'_'+Math.floor(Math.random()*999);p.price=0;state.players.push(p);state.bench.push(p.id);return p;}
function openPack(cost,type){if(state.gems<cost){toast('Недостаточно самоцветов');return;}state.gems-=cost;addStat('packs');let p=revealPlayer();save();updateWallet();drawSquad();modal('НАБОР ОТКРЫТ!',`${p.name} · ${p.pos} · рейтинг ${p.ovr}. Игрок добавлен в запас.`, `<div class="reveal-card"><strong>${p.ovr}</strong><b>${escapeHTML(p.name)}</b><span>${p.pos} · FROST UNITED</span></div>`);}
$$('.pack-buy').forEach(b=>b.addEventListener('click',()=>openPack(+b.dataset.cost,b.dataset.type||'standard')));
function renderPass(){let el=$('#passRewards');if(!el)return;el.innerHTML=passRewards.map((r,i)=>{let got=state.passClaimed.includes(i),ready=state.seasonXP>=r.need;return `<article class="pass-reward ${got?'done':ready?'current':''}"><small>УРОВЕНЬ ${i+1} · ${r.need} ОЧКОВ</small><b>${r.label}</b><button class="claim" data-pass="${i}" ${got||!ready?'disabled':''}>${got?'ПОЛУЧЕНО':ready?'ЗАБРАТЬ':'ЗАКРЫТО'}</button></article>`;}).join('');if($('#passProgress'))$('#passProgress').style.width=Math.min(100,state.seasonXP/3000*100)+'%';}
document.addEventListener('click',e=>{let b=e.target.closest('[data-pass]');if(!b||b.disabled)return;let i=+b.dataset.pass,r=passRewards[i];if(state.passClaimed.includes(i)||state.seasonXP<r.need)return;state.passClaimed.push(i);if(r.type==='pack'){let p=revealPlayer();modal('НАГРАДА ПАССА',`Получен игрок ${p.name}, рейтинг ${p.ovr}.`);}else if(r.type==='eventPlayer'){let p=revealPlayer('event');modal('WINTER WONDERKID',`Получен талант ${p.name}, рейтинг ${p.ovr}.`);}else{state[r.type]+=r.amount;modal('НАГРАДА ПОЛУЧЕНА',r.label);}save();updateWallet();renderAll();drawSquad();});
// Match engine: one real-time tick per simulated football minute; tactical changes and five substitutions are live.
let match={active:false,minute:0,home:0,away:0,subs:0,log:[],timer:null,style:state.style,formation:state.formation};
function renderMatchSetup(){if($('#matchMinute'))$('#matchMinute').textContent=match.active?match.minute+"'":'00\'';if($('#matchScore'))$('#matchScore').textContent=match.home+' — '+match.away;}
function matchLog(t){match.log.unshift(`${match.minute}' ${t}`);match.log=match.log.slice(0,8);if($('#matchLog'))$('#matchLog').innerHTML=match.log.map(x=>`<div>${escapeHTML(x)}</div>`).join('');}
function startMatch(){if(match.active)return;match={active:true,minute:0,home:0,away:0,subs:0,log:[],timer:null,style:state.style,formation:state.formation};$('#matchStart')?.setAttribute('disabled','disabled');$('#matchEnd')?.removeAttribute('disabled');matchLog('Матч начался. Свисток арбитра!');renderMatchSetup();match.timer=setInterval(matchTick,650);toast('Матч начался — каждое обновление = игровая минута');}
function matchTick(){if(!match.active)return;match.minute++;let attack=match.style==='Атака'?0.15:match.style==='Оборона'?-0.13:0;let rating=state.startingXI.reduce((n,id)=>n+playerById(id).ovr,0)/11;let homeChance=Math.max(.06,Math.min(.48,.20+(rating-60)*.006+attack));let awayChance=.19+(Math.random()*.08);let roll=Math.random();if(roll<homeChance*.20){match.home++;addStat('goals');matchLog('ГОЛ! Frost United забивает!');state.seasonXP+=15;state.eventPoints+=15;state.weeklyProgress.eventPoints+=15;}else if(roll>1-awayChance*.16){match.away++;matchLog('Соперник забивает гол.');}else if(roll<.48)matchLog(['Опасная атака хозяев','Удар — вратарь спасает','Подача с фланга','Перехват в центре поля','Стандарт у ворот соперника'][Math.floor(Math.random()*5)]);if(match.minute%5===0)matchLog('Контроль мяча: '+(50+Math.floor(Math.random()*21))+'%');renderMatchSetup();if($('#matchTimeline'))$('#matchTimeline').style.width=(match.minute/90*100)+'%';if(match.minute>=90)finishMatch();save();}
function finishMatch(){if(!match.active)return;clearInterval(match.timer);match.active=false;let won=match.home>match.away;state.coins+=won?50000:10000;state.stats.matches++;state.weeklyProgress.matches++;state.eventProgress.matches++;if(won){state.stats.wins++;state.weeklyProgress.wins++;state.eventProgress.wins++;}state.seasonXP+=50;state.eventPoints+=50;state.weeklyProgress.eventPoints+=50;state.clubLevel=1+Math.floor(state.seasonXP/500);state.history.unshift({date:new Date().toLocaleDateString('ru-RU'),score:`${match.home} — ${match.away}`,result:won?'Победа':match.home===match.away?'Ничья':'Поражение'});state.history=state.history.slice(0,10);save();updateWallet();renderAll();$('#matchStart')?.removeAttribute('disabled');$('#matchEnd')?.setAttribute('disabled','disabled');matchLog('Финальный свисток.');modal(won?'ПОБЕДА! +50 000':'МАТЧ ЗАВЕРШЁН',`${state.club?.name||'Frost United'} ${match.home} — ${match.away} Thunder FC. ${won?'Начислено 50 000 монет.':'Начислено 10 000 монет за участие.'}`);}
$('#matchStart')?.addEventListener('click',startMatch);$('#matchEnd')?.addEventListener('click',()=>{if(match.active)finishMatch();});$('#matchSkip')?.addEventListener('click',()=>{if(!match.active){startMatch();}if(match.active){clearInterval(match.timer);while(match.minute<90){match.timer=null;matchTick();} }});
function openMatchSubs(){if(!match.active){toast('Сначала начни матч');return;}if(match.subs>=5){toast('Все пять замен уже использованы');return;}let opts=state.bench.map(id=>{let p=playerById(id);return `<option value="${id}">${escapeHTML(p.name)} · ${p.pos} · ${p.ovr}</option>`}).join('');let starters=state.startingXI.map((id,i)=>{let p=playerById(id);return `<option value="${i}">${escapeHTML(p.name)} · ${p.pos} · ${p.ovr}</option>`}).join('');modal('ЗАМЕНА В МАТЧЕ',`Использовано замен: ${match.subs}/5.`, `<label class="modal-label">Уходит с поля</label><select id="subOut" class="modal-select">${starters}</select><label class="modal-label">Выходит на поле</label><select id="subIn" class="modal-select">${opts}</select><button class="primary full" id="doMatchSub">ПОДТВЕРДИТЬ ЗАМЕНУ</button>`);$('#doMatchSub')?.addEventListener('click',()=>{let oi=+$('#subOut').value,ii=$('#subIn').value;if(!ii)return;let bi=state.bench.indexOf(ii);if(bi<0)return;let old=state.startingXI[oi];state.startingXI[oi]=ii;state.bench[bi]=old;match.subs++;matchLog(`Замена: ${playerById(ii).name} вместо ${playerById(old).name}`);save();drawSquad();closeModal();toast('Замена выполнена ('+match.subs+'/5)');});}
$('#matchSubs')?.addEventListener('click',openMatchSubs);$('#matchFormation')?.addEventListener('change',e=>{state.formation=e.target.value;match.formation=state.formation;save();drawSquad();matchLog('Тактическая схема изменена: '+state.formation);});$('#matchStyle')?.addEventListener('change',e=>{state.style=e.target.value;match.style=state.style;save();matchLog('Стиль игры: '+state.style);});
function escapeHTML(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
// Player data import accepts JSON array or CSV: name,pos,ovr,price,club. This is the intended path for the user's 1,000-player database.
$('#playerImport')?.addEventListener('change',async e=>{let file=e.target.files[0];if(!file)return;try{let text=await file.text(),rows;if(file.name.toLowerCase().endsWith('.json'))rows=JSON.parse(text);else{let lines=text.split(/\r?\n/).filter(Boolean);rows=lines.slice(1).map(line=>{let [name,pos,ovr,price,club]=line.split(',');return {name,pos,ovr:+ovr,price:+price||0,club:club||'Imported'};});}if(!Array.isArray(rows))throw Error('Ожидается массив игроков');let added=0;rows.forEach((p,i)=>{if(!p.name||!p.pos||!Number(p.ovr))return;let id='imp_'+Date.now()+'_'+i;state.market.push({id,name:String(p.name),pos:String(p.pos).toUpperCase(),ovr:Math.max(40,Math.min(99,+p.ovr)),price:Math.max(0,+p.price||Math.round((+p.ovr)**3*80)),club:p.club||'Imported'});added++;});save();renderMarket();toast('Импортировано игроков: '+added);}catch(err){modal('ОШИБКА ИМПОРТА','Проверь JSON/CSV. Для CSV нужны колонки name,pos,ovr,price,club.');}e.target.value='';});
$('#resetSave')?.addEventListener('click',()=>{if(!confirm('Удалить сохранение и начать заново?'))return;localStorage.removeItem(STORE_KEY);state=freshState();save();location.reload();});
// Weekly reset on Monday; progress and claims are refreshed, currencies and club remain.
function checkWeek(){let d=new Date(),monday=new Date(d);monday.setHours(0,0,0,0);monday.setDate(d.getDate()-((d.getDay()+6)%7));let key=monday.toISOString().slice(0,10);if(state.weekStart!==key){state.weekStart=key;state.weeklyProgress={matches:0,goals:0,packs:0,wins:0,buys:0,eventPoints:0};state.weeklyClaimed=[];save();}}
checkWeek();if($('#formation'))$('#formation').value=state.formation;$$('.styles button').forEach(b=>b.classList.toggle('selected',b.textContent===state.style));if($('#matchFormation'))$('#matchFormation').value=state.formation;if($('#matchStyle'))$('#matchStyle').value=state.style;

/* v0.3 systems: separated currencies, persistent daily event, branches, club identity and portable saves */
const baseFreshState=freshState;
freshState=function(){let s=baseFreshState();s.gems=10;s.coins=30000;s.economyVersion=3;s.eventCoins=0;s.winterGems=0;s.club={name:'FROST UNITED',short:'FU',color:'#64c9f2',accent:'#f0ce85'};s.dailyDate=todayKey();s.dailyProgress={matches:0,goals:0,wins:0};s.dailyClaimed=[];s.branchProgress={matches:0,goals:0,wins:0,packs:0};s.branchClaimed=false;return s;};
/* migrate old saves without losing roster or progress */
if(!state.economyVersion){state.gems=10;state.economyVersion=3;}state.winterGems=Number(state.winterGems??state.eventCoins??0);state.eventCoins=state.winterGems;state.club=state.club||{name:'FROST UNITED',short:'FU',color:'#64c9f2',accent:'#f0ce85'};state.dailyDate=state.dailyDate||new Date().toLocaleDateString('en-CA');state.dailyProgress=state.dailyProgress||{matches:0,goals:0,wins:0};state.dailyClaimed=state.dailyClaimed||[];state.branchProgress=state.branchProgress||{matches:0,goals:0,wins:0,packs:0};state.branchClaimed=!!state.branchClaimed;
function todayKey(){let d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
function resetDailyIfNeeded(){let k=todayKey();if(state.dailyDate!==k){state.dailyDate=k;state.dailyProgress={matches:0,goals:0,wins:0};state.dailyClaimed=[];save();renderDaily();}}
const dailyDefs=[{title:'Сыграй 1 матч',desc:'Заверши любой матч',stat:'matches',goal:1,reward:5},{title:'Забей 2 гола',desc:'Забей два мяча за матчи',stat:'goals',goal:2,reward:8},{title:'Одержи победу',desc:'Выиграй один матч',stat:'wins',goal:1,reward:10}];
const branchDefs=[{title:'Первый шаг',desc:'Сыграй 3 матча',stat:'matches',goal:3},{title:'Голевая серия',desc:'Забей 8 голов',stat:'goals',goal:8},{title:'Победный характер',desc:'Выиграй 4 матча',stat:'wins',goal:4},{title:'Охотник за наборами',desc:'Открой 2 стандартных набора',stat:'packs',goal:2}];
function renderDaily(){let el=$('#dailyQuests');if(!el)return;el.innerHTML=dailyDefs.map((q,i)=>{let v=state.dailyProgress[q.stat]||0,done=v>=q.goal,got=state.dailyClaimed.includes(i);return `<article class="quest"><div class="quest-icon">☀</div><div class="quest-info"><b>${q.title}</b><small>${q.desc} · ${Math.min(v,q.goal)}/${q.goal}</small><div class="bar"><i style="width:${Math.min(100,v/q.goal*100)}%"></i></div></div><div class="quest-reward">❄ +${q.reward}</div><button class="claim" data-daily="${i}" ${!done||got?'disabled':''}>${got?'ПОЛУЧЕНО':done?'ЗАБРАТЬ':'В ПРОЦЕССЕ'}</button></article>`;}).join('');let next=new Date();next.setHours(24,0,0,0);let mins=Math.max(0,Math.floor((next-Date.now())/60000));let label=$('#dailyResetLabel');if(label)label.textContent=`ОБНОВЛЕНИЕ ЧЕРЕЗ ${Math.floor(mins/60)}Ч ${mins%60}М`;}
function renderBranch(){let el=$('#eventBranch');if(!el)return;let complete=branchDefs.every(q=>(state.branchProgress[q.stat]||0)>=q.goal);el.innerHTML=`<div class="branch-intro"><b>НЕДЕЛЬНАЯ ВЕТКА · ГЛАВА 01</b><p>Проходи испытания в любом порядке. Прогресс сохраняется между входами в игру.</p></div>${branchDefs.map((q,i)=>{let v=state.branchProgress[q.stat]||0,done=v>=q.goal;return `<div class="branch-step ${done?'complete':''}"><span>${done?'✓':String(i+1).padStart(2,'0')}</span><div><b>${q.title}</b><small>${q.desc} · ${Math.min(v,q.goal)}/${q.goal}</small><div class="bar"><i style="width:${Math.min(100,v/q.goal*100)}%"></i></div></div><strong>${done?'ГОТОВО':'ЗАДАНИЕ'}</strong></div>`;}).join('')}<div class="branch-final"><div><small>ФИНАЛЬНАЯ НАГРАДА</small><b>120 ЖЕТОНОВ СОБЫТИЯ</b><p>${state.branchClaimed?'Жетоны уже начислены.':complete?'Ветка пройдена — забери жетоны!':'Выполни все четыре этапа.'}</p></div><button class="primary" id="claimBranchPlayer" ${!complete||state.branchClaimed?'disabled':''}>${state.branchClaimed?'ПОЛУЧЕНО':'ЗАБРАТЬ 120 ЖЕТОНОВ'}</button></div>`;}
function renderAllV3(){renderAllBase();renderDaily();renderBranch();updateOverall();}
const renderAllBase=renderAll;
renderAll=renderAllV3;
const updateWalletBase=()=>{['gems','coins','eventCoins'].forEach(k=>{const e=$('#'+k);if(e)e.textContent=fmt(state[k]);});if($('#marketBalance'))$('#marketBalance').textContent=fmt(state.coins);if($('#storeGems'))$('#storeGems').textContent=fmt(state.gems)+' ◆';if($('#points'))$('#points').textContent=fmt(state.eventPoints);if($('#passPoints'))$('#passPoints').textContent=fmt(state.seasonXP);if($('#clubLevel'))$('#clubLevel').textContent=state.clubLevel;};
updateWallet=function(){state.eventCoins=state.winterGems;updateWalletBase();if($('#eventGemBalance'))$('#eventGemBalance').textContent=fmt(state.winterGems);if($('#storeGems'))$('#storeGems').textContent=fmt(state.gems)+' ◆';};
const addStatBase=addStat;
addStat=function(key,n=1){addStatBase(key,n);if(['matches','goals','wins','packs'].includes(key)){if(key!=='packs')state.dailyProgress[key]=(state.dailyProgress[key]||0)+n;state.branchProgress[key]=(state.branchProgress[key]||0)+n;}renderDaily();renderBranch();save();};
const openPackBase=openPack;
revealPlayer=function(pool='pack',type='gold'){
 let list=state.market.filter(p=>p.ovr>=55);let min=type==='starter'?55:type==='elite'?78:65,max=type==='starter'?72:type==='elite'?90:85;
 let candidates=list.filter(p=>p.ovr>=min&&p.ovr<=max);if(!candidates.length)candidates=list.length?list:defaultPlayers;
 let p={...candidates[Math.floor(Math.random()*candidates.length)]};p.id='owned_pack_'+Date.now()+'_'+Math.floor(Math.random()*9999);p.price=0;p.source='pack';state.players.push(p);if(!state.bench.includes(p.id))state.bench.push(p.id);return p;
};
openPack=function(cost,type='gold'){if(state.gems<cost){toast('Недостаточно обычных самоцветов');return;}state.gems-=cost;addStat('packs');let p=revealPlayer('pack',type);save();updateWallet();drawSquad();updateOverall();modal('ИГРОК ПОЛУЧЕН!',`${p.name} · ${p.pos} · рейтинг ${p.ovr}. Карточка сохранена в клубе и добавлена в запас.`, `<div class="reveal-card"><strong>${p.ovr}</strong><b>${escapeHTML(p.name)}</b><span>${p.pos} · ${escapeHTML(p.club||'FROST UNITED')}</span><small>ИГРОК ДОБАВЛЕН В СОСТАВ КЛУБА</small></div>`);};
/* event currency is never used for regular packs */
document.addEventListener('click',e=>{let b=e.target.closest('.winter-pack-buy');if(!b)return;let cost=Number(b.dataset.winterCost||30);if(state.winterGems<cost){toast('Недостаточно зимних самоцветов — получай их за ежедневные ивент-задания');return;}state.winterGems-=cost;state.eventCoins=state.winterGems;let p=revealPlayer('event','elite');p.ovr=75+Math.floor(Math.random()*6);p.club='WINTER WUNDERKIND';save();updateWallet();drawSquad();modal('ЗИМНИЙ НАБОР ОТКРЫТ',`${p.name} · ${p.pos} · ${p.ovr} OVR. Игрок добавлен в запас.`, `<div class="reveal-card winter-reveal"><strong>${p.ovr}</strong><b>${escapeHTML(p.name)}</b><span>${p.pos} · WINTER WUNDERKIND</span></div>`);});
document.addEventListener('click',e=>{let b=e.target.closest('[data-daily]');if(!b||b.disabled)return;let i=+b.dataset.daily,q=dailyDefs[i];if(!q||state.dailyClaimed.includes(i)||(state.dailyProgress[q.stat]||0)<q.goal)return;state.dailyClaimed.push(i);state.winterGems+=q.reward;state.eventCoins=state.winterGems;state.eventPoints+=q.reward*5;state.seasonXP+=q.reward*5;save();updateWallet();renderDaily();renderBranch();toast(`Получено ${q.reward} зимних самоцветов`);});
document.addEventListener('click',e=>{if(e.target.id!=='claimBranchPlayer'||e.target.disabled)return;let p=revealPlayer('event','elite');p.name=['Ноа Винтер','Лео Фрост','Элиас Норд','Микаэль Сноу','Тео Блум'][Math.floor(Math.random()*5)];p.ovr=75+Math.floor(Math.random()*6);p.club='WINTER WUNDERKIND';state.branchClaimed=true;save();drawSquad();updateOverall();renderBranch();modal('ТАЛАНТ ПОЛУЧЕН!',`${p.name} · ${p.pos} · ${p.ovr} OVR. Он уже находится в запасе твоего клуба.`, `<div class="reveal-card winter-reveal"><strong>${p.ovr}</strong><b>${escapeHTML(p.name)}</b><span>WINTER WONDERKID</span></div>`);});
function updateOverall(){let ids=state.startingXI||[],avg=Math.round(ids.reduce((n,id)=>n+Number(playerById(id).ovr||50),0)/Math.max(1,ids.length));if($('#homeOVR'))$('#homeOVR').textContent=avg;if($('#homeOVRBar'))$('#homeOVRBar').style.width=avg+'%';if($('#squadOVR'))$('#squadOVR').textContent=avg;}
function applyClub(){let c=state.club||{};let name=c.name||'FROST UNITED';if($('#clubNameSide'))$('#clubNameSide').textContent=name;if($('#clubCrest'))$('#clubCrest').textContent=(c.short||'FU').slice(0,3);document.documentElement.style.setProperty('--club-color',c.color||'#64c9f2');document.documentElement.style.setProperty('--club-accent',c.accent||'#f0ce85');if($('#clubNameInput'))$('#clubNameInput').value=name;if($('#clubShortInput'))$('#clubShortInput').value=c.short||'FU';if($('#clubColorInput'))$('#clubColorInput').value=c.color||'#64c9f2';if($('#clubAccentInput'))$('#clubAccentInput').value=c.accent||'#f0ce85';$$('.pitch-head').forEach(x=>{x.childNodes[0].textContent=name+' ';});$$('.teams span:first-child').forEach(x=>x.textContent=name);}
$('#saveClubSettings')?.addEventListener('click',()=>{state.club={name:($('#clubNameInput')?.value||'FROST UNITED').trim().toUpperCase().slice(0,24),short:($('#clubShortInput')?.value||'FU').trim().toUpperCase().slice(0,3),color:$('#clubColorInput')?.value||'#64c9f2',accent:$('#clubAccentInput')?.value||'#f0ce85'};save();applyClub();toast('Настройки клуба сохранены');});
$('#exportSave')?.addEventListener('click',()=>{save();let blob=new Blob([JSON.stringify({game:'FC Ultimate Club',version:'0.6',exportedAt:new Date().toISOString(),state},null,2)],{type:'application/json'});let url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='FC_Ultimate_Club_Save_v06.json';document.body.append(a);a.click();a.remove();URL.revokeObjectURL(url);toast('Файл сохранения подготовлен');});
$('#importSave')?.addEventListener('change',async e=>{let f=e.target.files?.[0];if(!f)return;try{let raw=JSON.parse(await f.text()),incoming=raw.state||raw;if(!incoming.players||!incoming.startingXI)throw Error('bad save');state={...freshState(),...incoming};state.winterGems=Number(state.winterGems??state.eventCoins??0);state.eventCoins=state.winterGems;save();toast('Сохранение загружено');setTimeout(()=>location.reload(),500);}catch(err){modal('ОШИБКА СОХРАНЕНИЯ','Файл не похож на сохранение FC Ultimate Club.');}e.target.value='';});
/* A match should feel like football: expected 0–3 goals per side, not arcade hockey scores. */
const matchTickBase=matchTick;
matchTick=function(){if(!match.active)return;match.minute++;let rating=state.startingXI.reduce((n,id)=>n+playerById(id).ovr,0)/Math.max(1,state.startingXI.length);let attack=match.style==='Атака'?.025:match.style==='Оборона'?-.025:0;let strength=Math.max(.72,Math.min(1.3,.9+(rating-60)*.008));let homeGoalChance=(.018+attack)*strength;let awayGoalChance=.019;let r=Math.random();if(r<homeGoalChance){match.home++;addStat('goals');matchLog('ГОЛ! '+(state.club?.name||'Frost United')+' забивает!');state.seasonXP+=10;state.eventPoints+=10;state.weeklyProgress.eventPoints+=10;}else if(r>1-awayGoalChance){match.away++;matchLog('Соперник забивает гол.');}else if(match.minute%7===0)matchLog(['Опасная атака хозяев','Удар — вратарь спасает','Подача с фланга','Перехват в центре поля','Стандарт у ворот соперника'][Math.floor(Math.random()*5)]);renderMatchSetup();if($('#matchTimeline'))$('#matchTimeline').style.width=(match.minute/90*100)+'%';if(match.minute>=90)finishMatch();save();};
const finishMatchBase=finishMatch;
finishMatch=function(){if(!match.active)return;let beforeWins=state.stats.wins||0;finishMatchBase();let didWin=match.home>match.away;if(didWin){state.dailyProgress.wins=(state.dailyProgress.wins||0)+1;state.branchProgress.wins=(state.branchProgress.wins||0)+1;}state.dailyProgress.matches=(state.dailyProgress.matches||0)+1;state.branchProgress.matches=(state.branchProgress.matches||0)+1;renderDaily();renderBranch();updateOverall();applyClub();save();};
/* daily progress is date-keyed and survives reloads; check at every minute and on focus */
setInterval(()=>{resetDailyIfNeeded();renderDaily();},60000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)resetDailyIfNeeded();});
/* update navigation and first paint */
const navigateBase=navigate;
navigate=function(page){navigateBase(page);if(page==='settings')applyClub();if(page==='event'){renderDaily();renderBranch();}};
$$('.nav').forEach(b=>{if(b.dataset.page==='settings'&&!b.dataset.v3bound){b.dataset.v3bound='1';b.addEventListener('click',()=>navigate('settings'));}});
const drawSquadBaseV3=drawSquad;drawSquad=function(){drawSquadBaseV3();updateOverall();};
/* First paint is deferred until the v0.4 database helpers are initialized. */

/* ===== FC Ultimate Club v0.4: expanded database, event mode, reserves, tactics ===== */
const FCUC_PLAYER_DB = [{"name":"Lamine Yamal","pos":"RW","age":19,"nation":"Испания","club":"Барселона","value":220.0,"id":"db_0001","ovr":93,"price":3844000,"type":"base","stats":{"PAC":97,"SHO":96,"PAS":96,"DRI":98,"DEF":77,"PHY":89},"league":"Испанская Ла Лига"},{"name":"Erling Haaland","pos":"ST","age":26,"nation":"Норвегия","club":"Манчестер Сити","value":220.0,"id":"db_0002","ovr":93,"price":3844000,"type":"base","stats":{"PAC":98,"SHO":97,"PAS":91,"DRI":97,"DEF":74,"PHY":98},"league":"Английская Премьер-лига"},{"name":"Kylian Mbappé","pos":"ST","age":27,"nation":"Франция / Камерун","club":"Реал Мадрид","value":200.0,"id":"db_0003","ovr":92,"price":3447000,"type":"base","stats":{"PAC":96,"SHO":99,"PAS":89,"DRI":95,"DEF":72,"PHY":96},"league":"Испанская Ла Лига"},{"name":"Michael Olise","pos":"RW","age":24,"nation":"Франция / Англия","club":"Бавария Мюнхен","value":180.0,"id":"db_0004","ovr":91,"price":3092000,"type":"base","stats":{"PAC":98,"SHO":92,"PAS":92,"DRI":99,"DEF":73,"PHY":90},"league":"Немецкая Бундеслига"},{"name":"Jude Bellingham","pos":"CAM","age":23,"nation":"Англия / Ирландия","club":"Реал Мадрид","value":160.0,"id":"db_0005","ovr":91,"price":3092000,"type":"base","stats":{"PAC":92,"SHO":94,"PAS":96,"DRI":97,"DEF":76,"PHY":86},"league":"Испанская Ла Лига"},{"name":"Pedri","pos":"CM","age":23,"nation":"Испания","club":"Барселона","value":150.0,"id":"db_0006","ovr":90,"price":2773000,"type":"base","stats":{"PAC":87,"SHO":86,"PAS":97,"DRI":90,"DEF":89,"PHY":90},"league":"Испанская Ла Лига"},{"name":"João Neves","pos":"CM","age":22,"nation":"Португалия","club":"Пари Сен-Жермен","value":140.0,"id":"db_0007","ovr":90,"price":2773000,"type":"base","stats":{"PAC":88,"SHO":87,"PAS":93,"DRI":91,"DEF":90,"PHY":91},"league":"Французская Лига 1"},{"name":"Khvicha Kvaratskhelia","pos":"LW","age":25,"nation":"Грузия","club":"Пари Сен-Жермен","value":140.0,"id":"db_0008","ovr":90,"price":2773000,"type":"base","stats":{"PAC":98,"SHO":92,"PAS":93,"DRI":94,"DEF":73,"PHY":90},"league":"Французская Лига 1"},{"name":"Vitinha","pos":"CDM","age":26,"nation":"Португалия","club":"Пари Сен-Жермен","value":140.0,"id":"db_0009","ovr":90,"price":2773000,"type":"base","stats":{"PAC":89,"SHO":76,"PAS":93,"DRI":85,"DEF":97,"PHY":99},"league":"Французская Лига 1"},{"name":"Vinicius Junior","pos":"LW","age":26,"nation":"Бразилия / Испания","club":"Реал Мадрид","value":130.0,"id":"db_0010","ovr":89,"price":2487000,"type":"base","stats":{"PAC":95,"SHO":94,"PAS":90,"DRI":96,"DEF":70,"PHY":87},"league":"Испанская Ла Лига"},{"name":"Yan Diomande","pos":"RW","age":20,"nation":"Кот-д'Ивуар","club":"Реал Мадрид","value":120.0,"id":"db_0011","ovr":89,"price":2487000,"type":"base","stats":{"PAC":97,"SHO":91,"PAS":91,"DRI":93,"DEF":72,"PHY":89},"league":"Испанская Ла Лига"},{"name":"Désiré Doué","pos":"RW","age":21,"nation":"Франция / Кот-д'Ивуар","club":"Пари Сен-Жермен","value":120.0,"id":"db_0012","ovr":89,"price":2487000,"type":"base","stats":{"PAC":96,"SHO":90,"PAS":90,"DRI":97,"DEF":71,"PHY":88},"league":"Французская Лига 1"},{"name":"Elliot Anderson","pos":"CDM","age":24,"nation":"Англия / Шотландия","club":"Манчестер Сити","value":120.0,"id":"db_0013","ovr":89,"price":2487000,"type":"base","stats":{"PAC":86,"SHO":78,"PAS":90,"DRI":87,"DEF":94,"PHY":96},"league":"Английская Премьер-лига"},{"name":"Morgan Rogers","pos":"LW","age":24,"nation":"Англия / Ямайка","club":"Челси","value":120.0,"id":"db_0014","ovr":89,"price":2487000,"type":"base","stats":{"PAC":93,"SHO":92,"PAS":93,"DRI":94,"DEF":73,"PHY":85},"league":"Английская Премьер-лига"},{"name":"Enzo Fernández","pos":"CM","age":25,"nation":"Аргентина","club":"Манчестер Сити","value":120.0,"id":"db_0015","ovr":89,"price":2487000,"type":"base","stats":{"PAC":89,"SHO":83,"PAS":94,"DRI":92,"DEF":86,"PHY":92},"league":"Английская Премьер-лига"},{"name":"Declan Rice","pos":"CM","age":27,"nation":"Англия / Ирландия","club":"Арсенал","value":120.0,"id":"db_0016","ovr":89,"price":2487000,"type":"base","stats":{"PAC":89,"SHO":83,"PAS":94,"DRI":92,"DEF":86,"PHY":92},"league":"Английская Премьер-лига"},{"name":"Rayan Cherki","pos":"CAM","age":23,"nation":"Франция / Алжир","club":"Манчестер Сити","value":110.0,"id":"db_0017","ovr":88,"price":2230000,"type":"base","stats":{"PAC":87,"SHO":89,"PAS":96,"DRI":92,"DEF":76,"PHY":81},"league":"Английская Премьер-лига"},{"name":"Fermín López","pos":"CAM","age":23,"nation":"Испания","club":"Барселона","value":110.0,"id":"db_0018","ovr":88,"price":2230000,"type":"base","stats":{"PAC":90,"SHO":87,"PAS":94,"DRI":95,"DEF":74,"PHY":84},"league":"Испанская Ла Лига"},{"name":"Cole Palmer","pos":"CAM","age":24,"nation":"Англия / Сент-Китс и Невис","club":"Челси","value":110.0,"id":"db_0019","ovr":88,"price":2230000,"type":"base","stats":{"PAC":90,"SHO":87,"PAS":94,"DRI":95,"DEF":74,"PHY":84},"league":"Английская Премьер-лига"},{"name":"Bukayo Saka","pos":"RW","age":25,"nation":"Англия / Нигерия","club":"Арсенал","value":110.0,"id":"db_0020","ovr":88,"price":2230000,"type":"base","stats":{"PAC":95,"SHO":89,"PAS":89,"DRI":96,"DEF":70,"PHY":87},"league":"Английская Премьер-лига"},{"name":"Julián Álvarez","pos":"ST","age":26,"nation":"Аргентина / Италия","club":"Атлетико Мадрид","value":110.0,"id":"db_0021","ovr":88,"price":2230000,"type":"base","stats":{"PAC":92,"SHO":96,"PAS":85,"DRI":91,"DEF":68,"PHY":92},"league":"Испанская Ла Лига"},{"name":"Pau Cubarsí","pos":"CB","age":19,"nation":"Испания","club":"Барселона","value":100.0,"id":"db_0022","ovr":88,"price":2230000,"type":"base","stats":{"PAC":85,"SHO":67,"PAS":86,"DRI":77,"DEF":96,"PHY":99},"league":"Испанская Ла Лига"},{"name":"Arda Güler","pos":"CAM","age":21,"nation":"Турция","club":"Реал Мадрид","value":100.0,"id":"db_0023","ovr":88,"price":2230000,"type":"base","stats":{"PAC":88,"SHO":90,"PAS":92,"DRI":93,"DEF":77,"PHY":82},"league":"Испанская Ла Лига"},{"name":"Bradley Barcola","pos":"LW","age":24,"nation":"Франция / Того","club":"Ливерпуль","value":100.0,"id":"db_0024","ovr":88,"price":2230000,"type":"base","stats":{"PAC":92,"SHO":91,"PAS":92,"DRI":93,"DEF":72,"PHY":84},"league":"Английская Премьер-лига"},{"name":"Moisés Caicedo","pos":"CDM","age":25,"nation":"Эквадор","club":"Челси","value":100.0,"id":"db_0025","ovr":88,"price":2230000,"type":"base","stats":{"PAC":85,"SHO":77,"PAS":89,"DRI":86,"DEF":93,"PHY":95},"league":"Английская Премьер-лига"},{"name":"João Pedro","pos":"ST","age":25,"nation":"Бразилия","club":"Челси","value":100.0,"id":"db_0026","ovr":88,"price":2230000,"type":"base","stats":{"PAC":91,"SHO":95,"PAS":84,"DRI":90,"DEF":72,"PHY":91},"league":"Английская Премьер-лига"},{"name":"William Saliba","pos":"CB","age":25,"nation":"Франция / Камерун","club":"Арсенал","value":100.0,"id":"db_0027","ovr":88,"price":2230000,"type":"base","stats":{"PAC":85,"SHO":67,"PAS":86,"DRI":77,"DEF":96,"PHY":99},"league":"Английская Премьер-лига"},{"name":"Dominik Szoboszlai","pos":"CAM","age":26,"nation":"Венгрия","club":"Ливерпуль","value":100.0,"id":"db_0028","ovr":88,"price":2230000,"type":"base","stats":{"PAC":90,"SHO":87,"PAS":94,"DRI":95,"DEF":74,"PHY":84},"league":"Английская Премьер-лига"},{"name":"Ousmane Dembélé","pos":"ST","age":29,"nation":"Франция","club":"Пари Сен-Жермен","value":100.0,"id":"db_0029","ovr":88,"price":2230000,"type":"base","stats":{"PAC":94,"SHO":93,"PAS":87,"DRI":88,"DEF":70,"PHY":94},"league":"Французская Лига 1"},{"name":"Ayyoub Bouaddi","pos":"CDM","age":19,"nation":"Марокко / Франция","club":"Манчестер Сити","value":90.0,"id":"db_0030","ovr":87,"price":2000000,"type":"base","stats":{"PAC":82,"SHO":74,"PAS":91,"DRI":83,"DEF":95,"PHY":92},"league":"Английская Премьер-лига"},{"name":"Aleksandar Pavlovic","pos":"CDM","age":22,"nation":"Германия / Сербия","club":"Бавария Мюнхен","value":90.0,"id":"db_0031","ovr":87,"price":2000000,"type":"base","stats":{"PAC":85,"SHO":72,"PAS":89,"DRI":86,"DEF":93,"PHY":95},"league":"Немецкая Бундеслига"},{"name":"Sandro Tonali","pos":"CDM","age":26,"nation":"Италия","club":"Тоттенхэм Хотспур","value":90.0,"id":"db_0032","ovr":87,"price":2000000,"type":"base","stats":{"PAC":86,"SHO":73,"PAS":90,"DRI":82,"DEF":94,"PHY":96},"league":"Английская Премьер-лига"},{"name":"Alexander Isak","pos":"ST","age":27,"nation":"Швеция / Эритрея","club":"Ливерпуль","value":90.0,"id":"db_0033","ovr":87,"price":2000000,"type":"base","stats":{"PAC":89,"SHO":93,"PAS":87,"DRI":88,"DEF":70,"PHY":89},"league":"Английская Премьер-лига"},{"name":"Federico Valverde","pos":"CM","age":28,"nation":"Уругвай / Испания","club":"Реал Мадрид","value":90.0,"id":"db_0034","ovr":87,"price":2000000,"type":"base","stats":{"PAC":87,"SHO":81,"PAS":92,"DRI":90,"DEF":84,"PHY":90},"league":"Испанская Ла Лига"},{"name":"Florian Wirtz","pos":"CAM","age":23,"nation":"Германия","club":"Ливерпуль","value":85.0,"id":"db_0035","ovr":86,"price":1794000,"type":"base","stats":{"PAC":85,"SHO":87,"PAS":94,"DRI":90,"DEF":74,"PHY":79},"league":"Английская Премьер-лига"},{"name":"Lautaro Martínez","pos":"ST","age":29,"nation":"Аргентина","club":"Интернационале","value":85.0,"id":"db_0036","ovr":86,"price":1794000,"type":"base","stats":{"PAC":90,"SHO":94,"PAS":83,"DRI":89,"DEF":66,"PHY":90},"league":"Итальянская Серия А"},{"name":"Estêvão","pos":"RW","age":19,"nation":"Бразилия","club":"Челси","value":80.0,"id":"db_0037","ovr":86,"price":1794000,"type":"base","stats":{"PAC":90,"SHO":89,"PAS":89,"DRI":91,"DEF":70,"PHY":82},"league":"Английская Премьер-лига"},{"name":"Warren Zaïre-Emery","pos":"CM","age":20,"nation":"Франция / Мартиника","club":"Пари Сен-Жермен","value":80.0,"id":"db_0038","ovr":86,"price":1794000,"type":"base","stats":{"PAC":85,"SHO":84,"PAS":90,"DRI":88,"DEF":82,"PHY":88},"league":"Французская Лига 1"},{"name":"Nico Paz","pos":"CAM","age":22,"nation":"Аргентина / Испания","club":"Комо 1907","value":80.0,"id":"db_0039","ovr":86,"price":1794000,"type":"base","stats":{"PAC":85,"SHO":87,"PAS":94,"DRI":90,"DEF":74,"PHY":79},"league":"Итальянская Серия А"},{"name":"Jamal Musiala","pos":"CAM","age":23,"nation":"Германия / Англия","club":"Бавария Мюнхен","value":80.0,"id":"db_0040","ovr":86,"price":1794000,"type":"base","stats":{"PAC":88,"SHO":85,"PAS":92,"DRI":93,"DEF":72,"PHY":82},"league":"Немецкая Бундеслига"},{"name":"Hugo Ekitiké","pos":"ST","age":24,"nation":"Франция / Камерун","club":"Ливерпуль","value":80.0,"id":"db_0041","ovr":86,"price":1794000,"type":"base","stats":{"PAC":88,"SHO":92,"PAS":86,"DRI":87,"DEF":69,"PHY":88},"league":"Английская Премьер-лига"},{"name":"Nuno Mendes","pos":"LB","age":24,"nation":"Португалия","club":"Пари Сен-Жермен","value":80.0,"id":"db_0042","ovr":86,"price":1794000,"type":"base","stats":{"PAC":91,"SHO":69,"PAS":87,"DRI":82,"DEF":90,"PHY":90},"league":"Французская Лига 1"},{"name":"Willian Pacho","pos":"CB","age":25,"nation":"Эквадор","club":"Пари Сен-Жермен","value":80.0,"id":"db_0043","ovr":86,"price":1794000,"type":"base","stats":{"PAC":80,"SHO":67,"PAS":81,"DRI":77,"DEF":96,"PHY":94},"league":"Французская Лига 1"},{"name":"Anthony Gordon","pos":"LW","age":25,"nation":"Англия / Шотландия","club":"Барселона","value":80.0,"id":"db_0044","ovr":86,"price":1794000,"type":"base","stats":{"PAC":92,"SHO":91,"PAS":87,"DRI":93,"DEF":67,"PHY":84},"league":"Испанская Ла Лига"},{"name":"Morgan Gibbs-White","pos":"CAM","age":26,"nation":"Англия / Ямайка","club":"Ноттингем Форест","value":80.0,"id":"db_0045","ovr":86,"price":1794000,"type":"base","stats":{"PAC":89,"SHO":86,"PAS":93,"DRI":89,"DEF":73,"PHY":83},"league":"Английская Премьер-лига"},{"name":"Antoine Semenyo","pos":"RW","age":26,"nation":"Гана / Англия","club":"Манчестер Сити","value":80.0,"id":"db_0046","ovr":86,"price":1794000,"type":"base","stats":{"PAC":94,"SHO":88,"PAS":88,"DRI":90,"DEF":69,"PHY":86},"league":"Английская Премьер-лига"},{"name":"Martin Ødegaard","pos":"CAM","age":27,"nation":"Норвегия","club":"Арсенал","value":80.0,"id":"db_0047","ovr":86,"price":1794000,"type":"base","stats":{"PAC":86,"SHO":88,"PAS":90,"DRI":91,"DEF":75,"PHY":80},"league":"Английская Премьер-лига"},{"name":"Achraf Hakimi","pos":"RB","age":28,"nation":"Марокко / Испания","club":"Пари Сен-Жермен","value":80.0,"id":"db_0048","ovr":86,"price":1794000,"type":"base","stats":{"PAC":88,"SHO":71,"PAS":84,"DRI":84,"DEF":92,"PHY":87},"league":"Французская Лига 1"},{"name":"Kenan Yıldız","pos":"LW","age":21,"nation":"Турция / Германия","club":"Ювентус","value":75.0,"id":"db_0049","ovr":85,"price":1609000,"type":"base","stats":{"PAC":91,"SHO":90,"PAS":86,"DRI":92,"DEF":66,"PHY":83},"league":"Итальянская Серия А"},{"name":"Kobbie Mainoo","pos":"CM","age":21,"nation":"Англия / Гана","club":"Манчестер Юнайтед","value":75.0,"id":"db_0050","ovr":85,"price":1609000,"type":"base","stats":{"PAC":85,"SHO":79,"PAS":90,"DRI":88,"DEF":82,"PHY":88},"league":"Английская Премьер-лига"},{"name":"Adam Wharton","pos":"CDM","age":22,"nation":"Англия","club":"Кристал Пэлас","value":75.0,"id":"db_0051","ovr":85,"price":1609000,"type":"base","stats":{"PAC":83,"SHO":70,"PAS":87,"DRI":84,"DEF":91,"PHY":93},"league":"Английская Премьер-лига"},{"name":"Benjamin Šeško","pos":"ST","age":23,"nation":"Словения","club":"Манчестер Юнайтед","value":75.0,"id":"db_0052","ovr":85,"price":1609000,"type":"base","stats":{"PAC":89,"SHO":93,"PAS":82,"DRI":88,"DEF":65,"PHY":89},"league":"Английская Премьер-лига"},{"name":"Jérémy Doku","pos":"LW","age":24,"nation":"Бельгия / Гана","club":"Манчестер Сити","value":75.0,"id":"db_0053","ovr":85,"price":1609000,"type":"base","stats":{"PAC":89,"SHO":88,"PAS":89,"DRI":90,"DEF":69,"PHY":81},"league":"Английская Премьер-лига"},{"name":"Ryan Gravenberch","pos":"CDM","age":24,"nation":"Нидерланды / Суринам","club":"Ливерпуль","value":75.0,"id":"db_0054","ovr":85,"price":1609000,"type":"base","stats":{"PAC":83,"SHO":70,"PAS":87,"DRI":84,"DEF":91,"PHY":93},"league":"Английская Премьер-лига"},{"name":"Josko Gvardiol","pos":"LB","age":24,"nation":"Хорватия","club":"Манчестер Сити","value":75.0,"id":"db_0055","ovr":85,"price":1609000,"type":"base","stats":{"PAC":90,"SHO":68,"PAS":86,"DRI":81,"DEF":89,"PHY":89},"league":"Английская Премьер-лига"},{"name":"Marc Guéhi","pos":"CB","age":26,"nation":"Англия / Кот-д'Ивуар","club":"Манчестер Сити","value":75.0,"id":"db_0056","ovr":85,"price":1609000,"type":"base","stats":{"PAC":81,"SHO":63,"PAS":82,"DRI":78,"DEF":92,"PHY":95},"league":"Английская Премьер-лига"},{"name":"Bryan Mbeumo","pos":"RW","age":27,"nation":"Камерун / Франция","club":"Манчестер Юнайтед","value":75.0,"id":"db_0057","ovr":85,"price":1609000,"type":"base","stats":{"PAC":91,"SHO":90,"PAS":85,"DRI":92,"DEF":66,"PHY":83},"league":"Английская Премьер-лига"},{"name":"Matheus Cunha","pos":"ST","age":27,"nation":"Бразилия","club":"Манчестер Юнайтед","value":75.0,"id":"db_0058","ovr":85,"price":1609000,"type":"base","stats":{"PAC":90,"SHO":89,"PAS":83,"DRI":89,"DEF":66,"PHY":90},"league":"Английская Премьер-лига"},{"name":"Cody Gakpo","pos":"LW","age":27,"nation":"Нидерланды / Того","club":"Ливерпуль","value":75.0,"id":"db_0059","ovr":85,"price":1609000,"type":"base","stats":{"PAC":91,"SHO":90,"PAS":86,"DRI":92,"DEF":66,"PHY":83},"league":"Английская Премьер-лига"},{"name":"Dayot Upamecano","pos":"CB","age":28,"nation":"Франция / Гвинея-Бисау","club":"Бавария Мюнхен","value":75.0,"id":"db_0060","ovr":85,"price":1609000,"type":"base","stats":{"PAC":78,"SHO":65,"PAS":84,"DRI":75,"DEF":94,"PHY":92},"league":"Немецкая Бундеслига"},{"name":"Gabriel","pos":"CB","age":28,"nation":"Бразилия","club":"Арсенал","value":75.0,"id":"db_0061","ovr":85,"price":1609000,"type":"base","stats":{"PAC":81,"SHO":63,"PAS":82,"DRI":78,"DEF":92,"PHY":95},"league":"Английская Премьер-лига"},{"name":"Bruno Guimarães","pos":"CM","age":29,"nation":"Бразилия / Испания","club":"Арсенал","value":75.0,"id":"db_0062","ovr":85,"price":1609000,"type":"base","stats":{"PAC":82,"SHO":81,"PAS":92,"DRI":85,"DEF":84,"PHY":85},"league":"Английская Премьер-лига"},{"name":"Junior Kroupi","pos":"ST","age":20,"nation":"Франция / Португалия","club":"Борнмут","value":70.0,"id":"db_0063","ovr":84,"price":1443000,"type":"base","stats":{"PAC":90,"SHO":89,"PAS":83,"DRI":84,"DEF":66,"PHY":90},"league":"Английская Премьер-лига"},{"name":"Nico O'Reilly","pos":"LB","age":21,"nation":"Англия / Ямайка","club":"Манчестер Сити","value":70.0,"id":"db_0064","ovr":84,"price":1443000,"type":"base","stats":{"PAC":88,"SHO":66,"PAS":84,"DRI":84,"DEF":87,"PHY":87},"league":"Английская Премьер-лига"},{"name":"Mateus Fernandes","pos":"CM","age":22,"nation":"Португалия","club":"Тоттенхэм Хотспур","value":70.0,"id":"db_0065","ovr":84,"price":1443000,"type":"base","stats":{"PAC":83,"SHO":82,"PAS":88,"DRI":86,"DEF":80,"PHY":86},"league":"Английская Премьер-лига"},{"name":"Alex Scott","pos":"CM","age":23,"nation":"Англия / Гернси","club":"Борнмут","value":70.0,"id":"db_0066","ovr":84,"price":1443000,"type":"base","stats":{"PAC":84,"SHO":78,"PAS":89,"DRI":87,"DEF":81,"PHY":87},"league":"Английская Премьер-лига"},{"name":"Pablo Barrios","pos":"CM","age":23,"nation":"Испания","club":"Атлетико Мадрид","value":70.0,"id":"db_0067","ovr":84,"price":1443000,"type":"base","stats":{"PAC":85,"SHO":79,"PAS":90,"DRI":83,"DEF":82,"PHY":88},"league":"Испанская Ла Лига"},{"name":"Jurriën Timber","pos":"RB","age":25,"nation":"Нидерланды / Кюрасао","club":"Арсенал","value":70.0,"id":"db_0068","ovr":84,"price":1443000,"type":"base","stats":{"PAC":87,"SHO":70,"PAS":83,"DRI":83,"DEF":86,"PHY":86},"league":"Английская Премьер-лига"},{"name":"Aurélien Tchouaméni","pos":"CDM","age":26,"nation":"Франция / Камерун","club":"Реал Мадрид","value":70.0,"id":"db_0069","ovr":84,"price":1443000,"type":"base","stats":{"PAC":81,"SHO":73,"PAS":85,"DRI":82,"DEF":89,"PHY":91},"league":"Испанская Ла Лига"},{"name":"Alexis Mac Allister","pos":"CM","age":27,"nation":"Аргентина / Италия","club":"Ливерпуль","value":70.0,"id":"db_0070","ovr":84,"price":1443000,"type":"base","stats":{"PAC":83,"SHO":82,"PAS":88,"DRI":86,"DEF":80,"PHY":86},"league":"Английская Премьер-лига"},{"name":"Luis Díaz","pos":"LW","age":29,"nation":"Колумбия","club":"Бавария Мюнхен","value":70.0,"id":"db_0071","ovr":84,"price":1443000,"type":"base","stats":{"PAC":88,"SHO":87,"PAS":88,"DRI":89,"DEF":68,"PHY":80},"league":"Немецкая Бундеслига"},{"name":"Raphinha","pos":"ST","age":29,"nation":"Бразилия / Италия","club":"Барселона","value":70.0,"id":"db_0072","ovr":84,"price":1443000,"type":"base","stats":{"PAC":89,"SHO":88,"PAS":82,"DRI":88,"DEF":65,"PHY":89},"league":"Испанская Ла Лига"},{"name":"Luka Vuskovic","pos":"CB","age":19,"nation":"Хорватия","club":"Брайтон энд Хоув Альбион","value":65.0,"id":"db_0073","ovr":83,"price":1294000,"type":"base","stats":{"PAC":79,"SHO":61,"PAS":80,"DRI":76,"DEF":90,"PHY":93},"league":"Английская Премьер-лига"},{"name":"Myles Lewis-Skelly","pos":"CDM","age":20,"nation":"Англия / Барбадос","club":"Арсенал","value":65.0,"id":"db_0074","ovr":83,"price":1294000,"type":"base","stats":{"PAC":80,"SHO":72,"PAS":84,"DRI":81,"DEF":88,"PHY":90},"league":"Английская Премьер-лига"},{"name":"Johan Manzambi","pos":"CAM","age":21,"nation":"Швейцария","club":"Астон Вилла","value":65.0,"id":"db_0075","ovr":83,"price":1294000,"type":"base","stats":{"PAC":85,"SHO":82,"PAS":89,"DRI":90,"DEF":69,"PHY":79},"league":"Английская Премьер-лига"},{"name":"Jérémy Jacquet","pos":"CB","age":21,"nation":"Франция / Гваделупа","club":"Ливерпуль","value":65.0,"id":"db_0076","ovr":83,"price":1294000,"type":"base","stats":{"PAC":80,"SHO":62,"PAS":81,"DRI":72,"DEF":91,"PHY":94},"league":"Английская Премьер-лига"},{"name":"Carlos Baleba","pos":"CDM","age":22,"nation":"Камерун","club":"Манчестер Юнайтед","value":65.0,"id":"db_0077","ovr":83,"price":1294000,"type":"base","stats":{"PAC":80,"SHO":72,"PAS":84,"DRI":81,"DEF":88,"PHY":90},"league":"Английская Премьер-лига"},{"name":"Riccardo Calafiori","pos":"LB","age":24,"nation":"Италия","club":"Арсенал","value":65.0,"id":"db_0078","ovr":83,"price":1294000,"type":"base","stats":{"PAC":88,"SHO":66,"PAS":84,"DRI":79,"DEF":87,"PHY":87},"league":"Английская Премьер-лига"},{"name":"Igor Thiago","pos":"ST","age":25,"nation":"Бразилия / Болгария","club":"Брентфорд","value":65.0,"id":"db_0079","ovr":83,"price":1294000,"type":"base","stats":{"PAC":88,"SHO":87,"PAS":81,"DRI":87,"DEF":64,"PHY":88},"league":"Английская Премьер-лига"},{"name":"Felix Nmecha","pos":"CM","age":26,"nation":"Германия / Англия","club":"Боруссия Дортмунд","value":65.0,"id":"db_0080","ovr":83,"price":1294000,"type":"base","stats":{"PAC":81,"SHO":80,"PAS":86,"DRI":84,"DEF":83,"PHY":84},"league":"Немецкая Бундеслига"},{"name":"Phil Foden","pos":"CAM","age":26,"nation":"Англия","club":"Манчестер Сити","value":65.0,"id":"db_0081","ovr":83,"price":1294000,"type":"base","stats":{"PAC":83,"SHO":85,"PAS":87,"DRI":88,"DEF":72,"PHY":77},"league":"Английская Премьер-лига"},{"name":"Iliman Ndiaye","pos":"LW","age":26,"nation":"Сенегал / Франция","club":"Манчестер Сити","value":65.0,"id":"db_0082","ovr":83,"price":1294000,"type":"base","stats":{"PAC":88,"SHO":87,"PAS":83,"DRI":89,"DEF":68,"PHY":80},"league":"Английская Премьер-лига"},{"name":"Alessandro Bastoni","pos":"CB","age":27,"nation":"Италия","club":"Интернационале","value":65.0,"id":"db_0083","ovr":83,"price":1294000,"type":"base","stats":{"PAC":76,"SHO":63,"PAS":82,"DRI":73,"DEF":92,"PHY":90},"league":"Итальянская Серия А"},{"name":"Martín Zubimendi","pos":"CDM","age":27,"nation":"Испания","club":"Арсенал","value":65.0,"id":"db_0084","ovr":83,"price":1294000,"type":"base","stats":{"PAC":78,"SHO":70,"PAS":87,"DRI":79,"DEF":91,"PHY":88},"league":"Английская Премьер-лига"},{"name":"Victor Osimhen","pos":"ST","age":27,"nation":"Нигерия","club":"Галатасарай","value":65.0,"id":"db_0085","ovr":83,"price":1294000,"type":"base","stats":{"PAC":87,"SHO":91,"PAS":80,"DRI":86,"DEF":63,"PHY":87},"league":"Другие лиги"},{"name":"Lennart Karl","pos":"CAM","age":18,"nation":"Германия","club":"Бавария Мюнхен","value":60.0,"id":"db_0086","ovr":82,"price":1161000,"type":"base","stats":{"PAC":85,"SHO":82,"PAS":89,"DRI":85,"DEF":69,"PHY":79},"league":"Немецкая Бундеслига"},{"name":"Rayan","pos":"RW","age":20,"nation":"Бразилия","club":"Борнмут","value":60.0,"id":"db_0087","ovr":82,"price":1161000,"type":"base","stats":{"PAC":86,"SHO":85,"PAS":85,"DRI":87,"DEF":66,"PHY":78},"league":"Английская Премьер-лига"},{"name":"Dean Huijsen","pos":"CB","age":21,"nation":"Испания / Нидерланды","club":"Реал Мадрид","value":60.0,"id":"db_0088","ovr":82,"price":1161000,"type":"base","stats":{"PAC":77,"SHO":64,"PAS":78,"DRI":74,"DEF":88,"PHY":91},"league":"Испанская Ла Лига"},{"name":"Rasmus Højlund","pos":"ST","age":23,"nation":"Дания","club":"Наполи","value":60.0,"id":"db_0089","ovr":82,"price":1161000,"type":"base","stats":{"PAC":88,"SHO":87,"PAS":81,"DRI":82,"DEF":64,"PHY":88},"league":"Итальянская Серия А"},{"name":"Manu Koné","pos":"CM","age":25,"nation":"Франция / Кот-д'Ивуар","club":"Рома","value":60.0,"id":"db_0090","ovr":82,"price":1161000,"type":"base","stats":{"PAC":79,"SHO":78,"PAS":89,"DRI":82,"DEF":81,"PHY":82},"league":"Итальянская Серия А"},{"name":"Jan Paul van Hecke","pos":"CB","age":26,"nation":"Нидерланды","club":"Тоттенхэм Хотспур","value":60.0,"id":"db_0091","ovr":82,"price":1161000,"type":"base","stats":{"PAC":79,"SHO":61,"PAS":80,"DRI":71,"DEF":90,"PHY":93},"league":"Английская Премьер-лига"},{"name":"Maxence Lacroix","pos":"CB","age":26,"nation":"Франция","club":"Челси","value":60.0,"id":"db_0092","ovr":82,"price":1161000,"type":"base","stats":{"PAC":75,"SHO":62,"PAS":81,"DRI":72,"DEF":91,"PHY":89},"league":"Английская Премьер-лига"},{"name":"Pedro Neto","pos":"RW","age":26,"nation":"Португалия","club":"Челси","value":60.0,"id":"db_0093","ovr":82,"price":1161000,"type":"base","stats":{"PAC":89,"SHO":83,"PAS":83,"DRI":90,"DEF":64,"PHY":81},"league":"Английская Премьер-лига"},{"name":"Reece James","pos":"RB","age":26,"nation":"Англия / Гренада","club":"Челси","value":60.0,"id":"db_0094","ovr":82,"price":1161000,"type":"base","stats":{"PAC":84,"SHO":67,"PAS":80,"DRI":80,"DEF":88,"PHY":83},"league":"Английская Премьер-лига"},{"name":"Kai Havertz","pos":"ST","age":27,"nation":"Германия","club":"Арсенал","value":60.0,"id":"db_0095","ovr":82,"price":1161000,"type":"base","stats":{"PAC":87,"SHO":86,"PAS":80,"DRI":86,"DEF":63,"PHY":87},"league":"Английская Премьер-лига"},{"name":"Trent Alexander-Arnold","pos":"RB","age":28,"nation":"Англия","club":"Реал Мадрид","value":60.0,"id":"db_0096","ovr":82,"price":1161000,"type":"base","stats":{"PAC":85,"SHO":68,"PAS":81,"DRI":81,"DEF":84,"PHY":84},"league":"Испанская Ла Лига"},{"name":"Marc Cucurella","pos":"LB","age":28,"nation":"Испания","club":"Реал Мадрид","value":60.0,"id":"db_0097","ovr":82,"price":1161000,"type":"base","stats":{"PAC":83,"SHO":66,"PAS":84,"DRI":79,"DEF":87,"PHY":82},"league":"Испанская Ла Лига"},{"name":"Eberechi Eze","pos":"CAM","age":28,"nation":"Англия / Нигерия","club":"Арсенал","value":60.0,"id":"db_0098","ovr":82,"price":1161000,"type":"base","stats":{"PAC":85,"SHO":82,"PAS":89,"DRI":85,"DEF":69,"PHY":79},"league":"Английская Премьер-лига"},{"name":"Dani Olmo","pos":"CAM","age":28,"nation":"Испания","club":"Барселона","value":60.0,"id":"db_0099","ovr":82,"price":1161000,"type":"base","stats":{"PAC":83,"SHO":85,"PAS":87,"DRI":88,"DEF":67,"PHY":77},"league":"Испанская Ла Лига"},{"name":"Rodri","pos":"CDM","age":30,"nation":"Испания","club":"Барселона","value":60.0,"id":"db_0100","ovr":82,"price":1161000,"type":"base","stats":{"PAC":80,"SHO":67,"PAS":84,"DRI":81,"DEF":88,"PHY":90},"league":"Испанская Ла Лига"},{"name":"Harry Kane","pos":"ST","age":33,"nation":"Англия / Ирландия","club":"Бавария Мюнхен","value":60.0,"id":"db_0101","ovr":82,"price":1161000,"type":"base","stats":{"PAC":88,"SHO":87,"PAS":81,"DRI":82,"DEF":64,"PHY":88},"league":"Немецкая Бундеслига"},{"name":"Matias Fernandez-Pardo","pos":"ST","age":21,"nation":"Бельгия / Испания","club":"Ньюкасл Юнайтед","value":55.0,"id":"db_0102","ovr":81,"price":1041000,"type":"base","stats":{"PAC":84,"SHO":88,"PAS":77,"DRI":83,"DEF":65,"PHY":84},"league":"Английская Премьер-лига"},{"name":"Lewis Hall","pos":"LB","age":22,"nation":"Англия","club":"Ньюкасл Юнайтед","value":55.0,"id":"db_0103","ovr":81,"price":1041000,"type":"base","stats":{"PAC":86,"SHO":64,"PAS":82,"DRI":77,"DEF":85,"PHY":85},"league":"Английская Премьер-лига"},{"name":"Yankuba Minteh","pos":"RW","age":22,"nation":"Гамбия","club":"Брайтон энд Хоув Альбион","value":55.0,"id":"db_0104","ovr":81,"price":1041000,"type":"base","stats":{"PAC":89,"SHO":83,"PAS":83,"DRI":85,"DEF":64,"PHY":81},"league":"Английская Премьер-лига"},{"name":"Lamine Camara","pos":"CM","age":22,"nation":"Сенегал","club":"Монако","value":55.0,"id":"db_0105","ovr":81,"price":1041000,"type":"base","stats":{"PAC":80,"SHO":79,"PAS":85,"DRI":83,"DEF":77,"PHY":83},"league":"Французская Лига 1"},{"name":"Martin Baturina","pos":"CAM","age":23,"nation":"Хорватия","club":"Комо 1907","value":55.0,"id":"db_0106","ovr":81,"price":1041000,"type":"base","stats":{"PAC":80,"SHO":82,"PAS":89,"DRI":85,"DEF":69,"PHY":74},"league":"Итальянская Серия А"},{"name":"Ismael Saibari","pos":"CAM","age":25,"nation":"Марокко / Бельгия","club":"Бавария Мюнхен","value":55.0,"id":"db_0107","ovr":81,"price":1041000,"type":"base","stats":{"PAC":81,"SHO":83,"PAS":85,"DRI":86,"DEF":70,"PHY":75},"league":"Немецкая Бундеслига"},{"name":"Ferran Torres","pos":"ST","age":26,"nation":"Испания","club":"Пари Сен-Жермен","value":55.0,"id":"db_0108","ovr":81,"price":1041000,"type":"base","stats":{"PAC":83,"SHO":87,"PAS":81,"DRI":82,"DEF":64,"PHY":83},"league":"Французская Лига 1"},{"name":"Nico Schlotterbeck","pos":"CB","age":26,"nation":"Германия","club":"Боруссия Дортмунд","value":55.0,"id":"db_0109","ovr":81,"price":1041000,"type":"base","stats":{"PAC":75,"SHO":62,"PAS":76,"DRI":72,"DEF":91,"PHY":89},"league":"Немецкая Бундеслига"},{"name":"Donyell Malen","pos":"ST","age":27,"nation":"Нидерланды / Суринам","club":"Рома","value":55.0,"id":"db_0110","ovr":81,"price":1041000,"type":"base","stats":{"PAC":86,"SHO":85,"PAS":79,"DRI":85,"DEF":62,"PHY":86},"league":"Итальянская Серия А"},{"name":"Jules Koundé","pos":"RB","age":28,"nation":"Франция / Бенин","club":"Барселона","value":55.0,"id":"db_0111","ovr":81,"price":1041000,"type":"base","stats":{"PAC":84,"SHO":67,"PAS":80,"DRI":80,"DEF":83,"PHY":83},"league":"Испанская Ла Лига"},{"name":"Viktor Gyökeres","pos":"ST","age":28,"nation":"Швеция / Венгрия","club":"Арсенал","value":55.0,"id":"db_0112","ovr":81,"price":1041000,"type":"base","stats":{"PAC":87,"SHO":86,"PAS":80,"DRI":81,"DEF":63,"PHY":87},"league":"Английская Премьер-лига"},{"name":"Max Dowman","pos":"RW","age":16,"nation":"Англия","club":"Арсенал","value":50.0,"id":"db_0113","ovr":80,"price":934000,"type":"base","stats":{"PAC":88,"SHO":82,"PAS":82,"DRI":84,"DEF":63,"PHY":80},"league":"Английская Премьер-лига"},{"name":"Rio Ngumoha","pos":"LW","age":18,"nation":"Англия / Нигерия","club":"Ливерпуль","value":50.0,"id":"db_0114","ovr":80,"price":934000,"type":"base","stats":{"PAC":87,"SHO":81,"PAS":82,"DRI":88,"DEF":62,"PHY":79},"league":"Английская Премьер-лига"},{"name":"Ibrahim Mbaye","pos":"RW","age":18,"nation":"Сенегал / Франция","club":"Астон Вилла","value":50.0,"id":"db_0115","ovr":80,"price":934000,"type":"base","stats":{"PAC":87,"SHO":81,"PAS":81,"DRI":88,"DEF":62,"PHY":79},"league":"Английская Премьер-лига"},{"name":"Said El Mala","pos":"LW","age":20,"nation":"Германия","club":"Кёльн","value":50.0,"id":"db_0116","ovr":80,"price":934000,"type":"base","stats":{"PAC":85,"SHO":84,"PAS":80,"DRI":86,"DEF":65,"PHY":77},"league":"Немецкая Бундеслига"},{"name":"Bazoumana Touré","pos":"LW","age":20,"nation":"Кот-д'Ивуар","club":"Ньюкасл Юнайтед","value":50.0,"id":"db_0117","ovr":80,"price":934000,"type":"base","stats":{"PAC":86,"SHO":85,"PAS":81,"DRI":87,"DEF":61,"PHY":78},"league":"Английская Премьер-лига"},{"name":"Victor Froholdt","pos":"CM","age":20,"nation":"Дания","club":"Порту","value":50.0,"id":"db_0118","ovr":80,"price":934000,"type":"base","stats":{"PAC":80,"SHO":74,"PAS":85,"DRI":83,"DEF":77,"PHY":83},"league":"Португальская Примейра"},{"name":"Ibrahim Maza","pos":"CAM","age":20,"nation":"Алжир / Германия","club":"Байер 04 Леверкузен","value":50.0,"id":"db_0119","ovr":80,"price":934000,"type":"base","stats":{"PAC":81,"SHO":83,"PAS":85,"DRI":86,"DEF":65,"PHY":75},"league":"Немецкая Бундеслига"},{"name":"Pio Esposito","pos":"ST","age":21,"nation":"Италия","club":"Интернационале","value":50.0,"id":"db_0120","ovr":80,"price":934000,"type":"base","stats":{"PAC":85,"SHO":84,"PAS":78,"DRI":84,"DEF":61,"PHY":85},"league":"Итальянская Серия А"},{"name":"Sávio","pos":"LW","age":22,"nation":"Бразилия","club":"Тоттенхэм Хотспур","value":50.0,"id":"db_0121","ovr":80,"price":934000,"type":"base","stats":{"PAC":86,"SHO":85,"PAS":81,"DRI":87,"DEF":61,"PHY":78},"league":"Английская Премьер-лига"},{"name":"Abdukodir Khusanov","pos":"CB","age":22,"nation":"Узбекистан","club":"Манчестер Сити","value":50.0,"id":"db_0122","ovr":80,"price":934000,"type":"base","stats":{"PAC":74,"SHO":61,"PAS":75,"DRI":71,"DEF":90,"PHY":88},"league":"Английская Премьер-лига"},{"name":"Alberto Moleiro","pos":"LW","age":23,"nation":"Испания / Куба","club":"Вильярреал","value":50.0,"id":"db_0123","ovr":80,"price":934000,"type":"base","stats":{"PAC":88,"SHO":82,"PAS":83,"DRI":84,"DEF":63,"PHY":80},"league":"Испанская Ла Лига"},{"name":"Marc Pubill","pos":"CB","age":23,"nation":"Испания","club":"Атлетико Мадрид","value":50.0,"id":"db_0124","ovr":80,"price":934000,"type":"base","stats":{"PAC":76,"SHO":58,"PAS":77,"DRI":73,"DEF":87,"PHY":90},"league":"Испанская Ла Лига"},{"name":"Nathaniel Brown","pos":"LB","age":23,"nation":"Германия / Соединенные Штаты Америки","club":"Бавария Мюнхен","value":50.0,"id":"db_0125","ovr":80,"price":934000,"type":"base","stats":{"PAC":83,"SHO":66,"PAS":79,"DRI":79,"DEF":82,"PHY":82},"league":"Немецкая Бундеслига"},{"name":"Álvaro Carreras","pos":"LB","age":23,"nation":"Испания","club":"Реал Мадрид","value":50.0,"id":"db_0126","ovr":80,"price":934000,"type":"base","stats":{"PAC":81,"SHO":64,"PAS":82,"DRI":77,"DEF":85,"PHY":80},"league":"Испанская Ла Лига"},{"name":"Levi Colwill","pos":"CB","age":23,"nation":"Англия","club":"Челси","value":50.0,"id":"db_0127","ovr":80,"price":934000,"type":"base","stats":{"PAC":73,"SHO":60,"PAS":79,"DRI":70,"DEF":89,"PHY":87},"league":"Английская Премьер-лига"},{"name":"Jarell Quansah","pos":"CB","age":23,"nation":"Англия / Шотландия","club":"Байер 04 Леверкузен","value":50.0,"id":"db_0128","ovr":80,"price":934000,"type":"base","stats":{"PAC":74,"SHO":61,"PAS":75,"DRI":71,"DEF":90,"PHY":88},"league":"Немецкая Бундеслига"},{"name":"Castello Lukeba","pos":"CB","age":23,"nation":"Франция / Ангола","club":"РБ Лейпциг","value":50.0,"id":"db_0129","ovr":80,"price":934000,"type":"base","stats":{"PAC":77,"SHO":59,"PAS":78,"DRI":69,"DEF":88,"PHY":91},"league":"Немецкая Бундеслига"},{"name":"Eduardo Camavinga","pos":"CM","age":24,"nation":"Франция / Конго","club":"Реал Мадрид","value":50.0,"id":"db_0130","ovr":80,"price":934000,"type":"base","stats":{"PAC":79,"SHO":78,"PAS":84,"DRI":82,"DEF":76,"PHY":82},"league":"Испанская Ла Лига"},{"name":"Murillo","pos":"CB","age":24,"nation":"Бразилия","club":"Ноттингем Форест","value":50.0,"id":"db_0131","ovr":80,"price":934000,"type":"base","stats":{"PAC":75,"SHO":62,"PAS":76,"DRI":72,"DEF":86,"PHY":89},"league":"Английская Премьер-лига"},{"name":"Mamadou Sangaré","pos":"CM","age":24,"nation":"Мали","club":"Брентфорд","value":50.0,"id":"db_0132","ovr":80,"price":934000,"type":"base","stats":{"PAC":81,"SHO":75,"PAS":86,"DRI":79,"DEF":78,"PHY":84},"league":"Английская Премьер-лига"},{"name":"Maghnes Akliouche","pos":"RW","age":24,"nation":"Франция / Алжир","club":"Пари Сен-Жермен","value":50.0,"id":"db_0133","ovr":80,"price":934000,"type":"base","stats":{"PAC":85,"SHO":84,"PAS":79,"DRI":86,"DEF":65,"PHY":77},"league":"Французская Лига 1"},{"name":"Nick Woltemade","pos":"ST","age":24,"nation":"Германия","club":"Ювентус","value":50.0,"id":"db_0134","ovr":80,"price":934000,"type":"base","stats":{"PAC":84,"SHO":88,"PAS":77,"DRI":83,"DEF":60,"PHY":84},"league":"Итальянская Серия А"},{"name":"Brian Brobbey","pos":"ST","age":24,"nation":"Нидерланды / Гана","club":"Сандерленд","value":50.0,"id":"db_0135","ovr":80,"price":934000,"type":"base","stats":{"PAC":85,"SHO":84,"PAS":78,"DRI":84,"DEF":61,"PHY":85},"league":"Английская Премьер-лига"},{"name":"Piero Hincapié","pos":"CB","age":24,"nation":"Эквадор","club":"Арсенал","value":50.0,"id":"db_0136","ovr":80,"price":934000,"type":"base","stats":{"PAC":76,"SHO":58,"PAS":77,"DRI":73,"DEF":87,"PHY":90},"league":"Английская Премьер-лига"},{"name":"Nico González","pos":"CDM","age":24,"nation":"Испания","club":"Ньюкасл Юнайтед","value":50.0,"id":"db_0137","ovr":80,"price":934000,"type":"base","stats":{"PAC":79,"SHO":66,"PAS":83,"DRI":75,"DEF":87,"PHY":89},"league":"Английская Премьер-лига"},{"name":"Kevin Schade","pos":"LW","age":24,"nation":"Германия / Нигерия","club":"Брентфорд","value":50.0,"id":"db_0138","ovr":80,"price":934000,"type":"base","stats":{"PAC":86,"SHO":85,"PAS":81,"DRI":87,"DEF":61,"PHY":78},"league":"Английская Премьер-лига"},{"name":"Malick Thiaw","pos":"CB","age":25,"nation":"Германия / Финляндия","club":"Ньюкасл Юнайтед","value":50.0,"id":"db_0139","ovr":80,"price":934000,"type":"base","stats":{"PAC":75,"SHO":62,"PAS":76,"DRI":72,"DEF":86,"PHY":89},"league":"Английская Премьер-лига"},{"name":"Folarin Balogun","pos":"ST","age":25,"nation":"Соединенные Штаты Америки / Англия","club":"Монако","value":50.0,"id":"db_0140","ovr":80,"price":934000,"type":"base","stats":{"PAC":82,"SHO":86,"PAS":80,"DRI":81,"DEF":63,"PHY":82},"league":"Французская Лига 1"},{"name":"Gonçalo Ramos","pos":"ST","age":25,"nation":"Португалия","club":"Милан","value":50.0,"id":"db_0141","ovr":80,"price":934000,"type":"base","stats":{"PAC":85,"SHO":84,"PAS":78,"DRI":84,"DEF":61,"PHY":85},"league":"Итальянская Серия А"},{"name":"Micky van de Ven","pos":"CB","age":25,"nation":"Нидерланды","club":"Тоттенхэм Хотспур","value":50.0,"id":"db_0142","ovr":80,"price":934000,"type":"base","stats":{"PAC":75,"SHO":62,"PAS":76,"DRI":72,"DEF":86,"PHY":89},"league":"Английская Премьер-лига"},{"name":"James Garner","pos":"CDM","age":25,"nation":"Англия","club":"Эвертон","value":50.0,"id":"db_0143","ovr":80,"price":934000,"type":"base","stats":{"PAC":78,"SHO":65,"PAS":82,"DRI":79,"DEF":86,"PHY":88},"league":"Английская Премьер-лига"},{"name":"Yann Bisseck","pos":"CB","age":25,"nation":"Германия / Камерун","club":"Интернационале","value":50.0,"id":"db_0144","ovr":80,"price":934000,"type":"base","stats":{"PAC":75,"SHO":62,"PAS":76,"DRI":72,"DEF":86,"PHY":89},"league":"Итальянская Серия А"},{"name":"Boubacar Kamara","pos":"CDM","age":26,"nation":"Франция / Сенегал","club":"Астон Вилла","value":50.0,"id":"db_0145","ovr":80,"price":934000,"type":"base","stats":{"PAC":78,"SHO":65,"PAS":82,"DRI":79,"DEF":86,"PHY":88},"league":"Английская Премьер-лига"},{"name":"Omar Marmoush","pos":"ST","age":27,"nation":"Египет / Канада","club":"Тоттенхэм Хотспур","value":50.0,"id":"db_0146","ovr":80,"price":934000,"type":"base","stats":{"PAC":85,"SHO":84,"PAS":78,"DRI":84,"DEF":61,"PHY":85},"league":"Английская Премьер-лига"},{"name":"Tijjani Reijnders","pos":"CM","age":28,"nation":"Нидерланды","club":"Аль-Кадсия Эль-Хубар","value":50.0,"id":"db_0147","ovr":80,"price":934000,"type":"base","stats":{"PAC":80,"SHO":74,"PAS":85,"DRI":83,"DEF":77,"PHY":83},"league":"Саудовская Про-лига"},{"name":"Federico Dimarco","pos":"LB","age":29,"nation":"Италия","club":"Интернационале","value":50.0,"id":"db_0148","ovr":80,"price":934000,"type":"base","stats":{"PAC":81,"SHO":64,"PAS":82,"DRI":77,"DEF":85,"PHY":80},"league":"Итальянская Серия А"},{"name":"Ezri Konsa","pos":"CB","age":29,"nation":"Англия / ДР Конго","club":"Арсенал","value":50.0,"id":"db_0149","ovr":80,"price":934000,"type":"base","stats":{"PAC":75,"SHO":62,"PAS":76,"DRI":72,"DEF":86,"PHY":89},"league":"Английская Премьер-лига"},{"name":"Marcus Thuram","pos":"ST","age":29,"nation":"Франция / Гваделупа","club":"Интернационале","value":50.0,"id":"db_0150","ovr":80,"price":934000,"type":"base","stats":{"PAC":86,"SHO":85,"PAS":79,"DRI":80,"DEF":62,"PHY":86},"league":"Итальянская Серия А"},{"name":"Rúben Dias","pos":"CB","age":29,"nation":"Португалия","club":"Манчестер Сити","value":50.0,"id":"db_0151","ovr":80,"price":934000,"type":"base","stats":{"PAC":76,"SHO":58,"PAS":77,"DRI":73,"DEF":87,"PHY":90},"league":"Английская Премьер-лига"},{"name":"Nicolò Barella","pos":"CM","age":29,"nation":"Италия","club":"Интернационале","value":50.0,"id":"db_0152","ovr":80,"price":934000,"type":"base","stats":{"PAC":77,"SHO":76,"PAS":87,"DRI":80,"DEF":79,"PHY":80},"league":"Итальянская Серия А"},{"name":"Franco Mastantuono","pos":"RW","age":19,"nation":"Аргентина / Италия","club":"Фиорентина","value":45.0,"id":"db_0153","ovr":79,"price":837000,"type":"base","stats":{"PAC":84,"SHO":83,"PAS":78,"DRI":85,"DEF":64,"PHY":76},"league":"Итальянская Серия А"},{"name":"Jorrel Hato","pos":"LB","age":20,"nation":"Нидерланды / Кюрасао","club":"Челси","value":45.0,"id":"db_0154","ovr":79,"price":837000,"type":"base","stats":{"PAC":82,"SHO":65,"PAS":78,"DRI":78,"DEF":81,"PHY":81},"league":"Английская Премьер-лига"},{"name":"Leny Yoro","pos":"CB","age":21,"nation":"Франция / Кот-д'Ивуар","club":"Манчестер Юнайтед","value":45.0,"id":"db_0155","ovr":79,"price":837000,"type":"base","stats":{"PAC":73,"SHO":60,"PAS":74,"DRI":70,"DEF":89,"PHY":87},"league":"Английская Премьер-лига"},{"name":"Can Uzun","pos":"CAM","age":21,"nation":"Турция / Германия","club":"Айнтрахт Франкфурт","value":45.0,"id":"db_0156","ovr":79,"price":837000,"type":"base","stats":{"PAC":80,"SHO":82,"PAS":84,"DRI":85,"DEF":64,"PHY":74},"league":"Немецкая Бундеслига"},{"name":"Tom Bischof","pos":"CM","age":21,"nation":"Германия","club":"Бавария Мюнхен","value":45.0,"id":"db_0157","ovr":79,"price":837000,"type":"base","stats":{"PAC":80,"SHO":74,"PAS":85,"DRI":78,"DEF":77,"PHY":83},"league":"Немецкая Бундеслига"},{"name":"Antonio Nusa","pos":"LW","age":21,"nation":"Норвегия / Нигерия","club":"РБ Лейпциг","value":45.0,"id":"db_0158","ovr":79,"price":837000,"type":"base","stats":{"PAC":85,"SHO":84,"PAS":80,"DRI":86,"DEF":60,"PHY":77},"league":"Немецкая Бундеслига"},{"name":"Marco Palestra","pos":"RB","age":21,"nation":"Италия","club":"Челси","value":45.0,"id":"db_0159","ovr":79,"price":837000,"type":"base","stats":{"PAC":82,"SHO":65,"PAS":78,"DRI":78,"DEF":81,"PHY":81},"league":"Английская Премьер-лига"},{"name":"Jacobo Ramón","pos":"CB","age":21,"nation":"Испания","club":"Комо 1907","value":45.0,"id":"db_0160","ovr":79,"price":837000,"type":"base","stats":{"PAC":72,"SHO":59,"PAS":78,"DRI":69,"DEF":88,"PHY":86},"league":"Итальянская Серия А"},{"name":"Diego Moreira","pos":"LM","age":22,"nation":"Бельгия / Португалия","club":"Милан","value":45.0,"id":"db_0161","ovr":79,"price":837000,"type":"base","stats":{"PAC":83,"SHO":81,"PAS":81,"DRI":83,"DEF":67,"PHY":78},"league":"Итальянская Серия А"},{"name":"Andrey Santos","pos":"CDM","age":22,"nation":"Бразилия","club":"Манчестер Юнайтед","value":45.0,"id":"db_0162","ovr":79,"price":837000,"type":"base","stats":{"PAC":77,"SHO":64,"PAS":81,"DRI":78,"DEF":85,"PHY":87},"league":"Английская Премьер-лига"},{"name":"Petar Sučić","pos":"CM","age":23,"nation":"Хорватия / Босния и Герцеговина","club":"Интернационале","value":45.0,"id":"db_0163","ovr":79,"price":837000,"type":"base","stats":{"PAC":78,"SHO":77,"PAS":83,"DRI":81,"DEF":75,"PHY":81},"league":"Итальянская Серия А"},{"name":"Yasin Ayari","pos":"CM","age":23,"nation":"Швеция / Тунис","club":"Брайтон энд Хоув Альбион","value":45.0,"id":"db_0164","ovr":79,"price":837000,"type":"base","stats":{"PAC":78,"SHO":77,"PAS":83,"DRI":81,"DEF":75,"PHY":81},"league":"Английская Премьер-лига"},{"name":"Tino Livramento","pos":"RB","age":24,"nation":"Англия / Шотландия","club":"Ньюкасл Юнайтед","value":45.0,"id":"db_0165","ovr":79,"price":837000,"type":"base","stats":{"PAC":83,"SHO":61,"PAS":79,"DRI":79,"DEF":82,"PHY":82},"league":"Английская Премьер-лига"},{"name":"Amad Diallo","pos":"RW","age":24,"nation":"Кот-д'Ивуар / Италия","club":"Манчестер Юнайтед","value":45.0,"id":"db_0166","ovr":79,"price":837000,"type":"base","stats":{"PAC":86,"SHO":80,"PAS":80,"DRI":87,"DEF":61,"PHY":78},"league":"Английская Премьер-лига"},{"name":"Jarrad Branthwaite","pos":"CB","age":24,"nation":"Англия","club":"Эвертон","value":45.0,"id":"db_0167","ovr":79,"price":837000,"type":"base","stats":{"PAC":76,"SHO":58,"PAS":77,"DRI":68,"DEF":87,"PHY":90},"league":"Английская Премьер-лига"},{"name":"Noni Madueke","pos":"RW","age":24,"nation":"Англия / Нигерия","club":"Арсенал","value":45.0,"id":"db_0168","ovr":79,"price":837000,"type":"base","stats":{"PAC":87,"SHO":81,"PAS":81,"DRI":83,"DEF":62,"PHY":79},"league":"Английская Премьер-лига"},{"name":"Crysencio Summerville","pos":"LW","age":25,"nation":"Нидерланды / Суринам","club":"Аль-Хилаль Эр-Рияд","value":45.0,"id":"db_0169","ovr":79,"price":837000,"type":"base","stats":{"PAC":86,"SHO":80,"PAS":81,"DRI":87,"DEF":61,"PHY":78},"league":"Саудовская Про-лига"},{"name":"Álex Baena","pos":"LW","age":25,"nation":"Испания","club":"Атлетико Мадрид","value":45.0,"id":"db_0170","ovr":79,"price":837000,"type":"base","stats":{"PAC":83,"SHO":82,"PAS":83,"DRI":84,"DEF":63,"PHY":75},"league":"Испанская Ла Лига"},{"name":"Nicolas Jackson","pos":"ST","age":25,"nation":"Сенегал / Гамбия","club":"Астон Вилла","value":45.0,"id":"db_0171","ovr":79,"price":837000,"type":"base","stats":{"PAC":85,"SHO":84,"PAS":78,"DRI":79,"DEF":61,"PHY":85},"league":"Английская Премьер-лига"},{"name":"Gabriel Martinelli","pos":"LW","age":25,"nation":"Бразилия / Италия","club":"Аль-Хилаль Эр-Рияд","value":45.0,"id":"db_0172","ovr":79,"price":837000,"type":"base","stats":{"PAC":83,"SHO":82,"PAS":83,"DRI":84,"DEF":63,"PHY":75},"league":"Саудовская Про-лига"},{"name":"Joan García","pos":"GK","age":25,"nation":"Испания","club":"Барселона","value":45.0,"id":"db_0173","ovr":79,"price":837000,"type":"base","stats":{"DIV":80,"HAN":81,"KIC":76,"REF":82,"SPD":72,"POS":80},"league":"Испанская Ла Лига"},{"name":"Angelo Stiller","pos":"CDM","age":25,"nation":"Германия","club":"Штутгарт","value":45.0,"id":"db_0174","ovr":79,"price":837000,"type":"base","stats":{"PAC":76,"SHO":68,"PAS":80,"DRI":77,"DEF":84,"PHY":86},"league":"Немецкая Бундеслига"},{"name":"Rodrygo","pos":"RW","age":25,"nation":"Бразилия / Испания","club":"Реал Мадрид","value":45.0,"id":"db_0175","ovr":79,"price":837000,"type":"base","stats":{"PAC":85,"SHO":84,"PAS":79,"DRI":86,"DEF":60,"PHY":77},"league":"Испанская Ла Лига"},{"name":"Eric García","pos":"CB","age":25,"nation":"Испания","club":"Барселона","value":45.0,"id":"db_0176","ovr":79,"price":837000,"type":"base","stats":{"PAC":74,"SHO":61,"PAS":75,"DRI":71,"DEF":85,"PHY":88},"league":"Испанская Ла Лига"},{"name":"Alphonso Davies","pos":"LB","age":26,"nation":"Канада / Либерия","club":"Бавария Мюнхен","value":45.0,"id":"db_0177","ovr":79,"price":837000,"type":"base","stats":{"PAC":84,"SHO":62,"PAS":80,"DRI":75,"DEF":83,"PHY":83},"league":"Немецкая Бундеслига"},{"name":"Mohammed Kudus","pos":"RW","age":26,"nation":"Гана","club":"Тоттенхэм Хотспур","value":45.0,"id":"db_0178","ovr":79,"price":837000,"type":"base","stats":{"PAC":86,"SHO":80,"PAS":80,"DRI":87,"DEF":61,"PHY":78},"league":"Английская Премьер-лига"},{"name":"Estéban Lepaul","pos":"ST","age":26,"nation":"Франция","club":"Стад Ренн","value":45.0,"id":"db_0179","ovr":79,"price":837000,"type":"base","stats":{"PAC":82,"SHO":86,"PAS":75,"DRI":81,"DEF":63,"PHY":82},"league":"Французская Лига 1"},{"name":"Pedro Porro","pos":"RB","age":27,"nation":"Испания","club":"Тоттенхэм Хотспур","value":45.0,"id":"db_0180","ovr":79,"price":837000,"type":"base","stats":{"PAC":81,"SHO":64,"PAS":77,"DRI":77,"DEF":85,"PHY":80},"league":"Английская Премьер-лига"},{"name":"Morten Hjulmand","pos":"CDM","age":27,"nation":"Дания","club":"Атлетико Мадрид","value":45.0,"id":"db_0181","ovr":79,"price":837000,"type":"base","stats":{"PAC":74,"SHO":66,"PAS":83,"DRI":75,"DEF":87,"PHY":84},"league":"Испанская Ла Лига"},{"name":"Ibrahima Konaté","pos":"CB","age":27,"nation":"Франция / Мали","club":"Реал Мадрид","value":45.0,"id":"db_0182","ovr":79,"price":837000,"type":"base","stats":{"PAC":72,"SHO":59,"PAS":78,"DRI":69,"DEF":88,"PHY":86},"league":"Испанская Ла Лига"},{"name":"Gianluigi Donnarumma","pos":"GK","age":27,"nation":"Италия","club":"Манчестер Сити","value":45.0,"id":"db_0183","ovr":79,"price":837000,"type":"base","stats":{"DIV":80,"HAN":81,"KIC":76,"REF":82,"SPD":72,"POS":80},"league":"Английская Премьер-лига"},{"name":"Matheus Nunes","pos":"RB","age":28,"nation":"Португалия / Бразилия","club":"Манчестер Сити","value":45.0,"id":"db_0184","ovr":79,"price":837000,"type":"base","stats":{"PAC":83,"SHO":61,"PAS":79,"DRI":79,"DEF":82,"PHY":82},"league":"Английская Премьер-лига"},{"name":"Ismaïla Sarr","pos":"RW","age":28,"nation":"Сенегал","club":"Кристал Пэлас","value":45.0,"id":"db_0185","ovr":79,"price":837000,"type":"base","stats":{"PAC":84,"SHO":83,"PAS":78,"DRI":85,"DEF":64,"PHY":76},"league":"Английская Премьер-лига"},{"name":"Lisandro Martínez","pos":"CB","age":28,"nation":"Аргентина","club":"Манчестер Юнайтед","value":45.0,"id":"db_0186","ovr":79,"price":837000,"type":"base","stats":{"PAC":74,"SHO":61,"PAS":75,"DRI":71,"DEF":85,"PHY":88},"league":"Английская Премьер-лига"},{"name":"Geovany Quenda","pos":"RW","age":19,"nation":"Португалия / Гвинея-Бисау","club":"Челси","value":42.0,"id":"db_0187","ovr":78,"price":751000,"type":"base","stats":{"PAC":86,"SHO":80,"PAS":80,"DRI":82,"DEF":61,"PHY":78},"league":"Английская Премьер-лига"},{"name":"Ousmane Diomande","pos":"CB","age":22,"nation":"Кот-д'Ивуар","club":"Ноттингем Форест","value":42.0,"id":"db_0188","ovr":78,"price":751000,"type":"base","stats":{"PAC":73,"SHO":60,"PAS":74,"DRI":70,"DEF":84,"PHY":87},"league":"Английская Премьер-лига"},{"name":"Honest Ahanor","pos":"CB","age":18,"nation":"Италия / Нигерия","club":"Кристал Пэлас","value":40.0,"id":"db_0189","ovr":78,"price":751000,"type":"base","stats":{"PAC":73,"SHO":60,"PAS":74,"DRI":70,"DEF":84,"PHY":87},"league":"Английская Премьер-лига"},{"name":"Charalampos Kostoulas","pos":"ST","age":19,"nation":"Греция","club":"Брайтон энд Хоув Альбион","value":40.0,"id":"db_0190","ovr":78,"price":751000,"type":"base","stats":{"PAC":82,"SHO":86,"PAS":75,"DRI":81,"DEF":58,"PHY":82},"league":"Английская Премьер-лига"},{"name":"Marc Bernal","pos":"CDM","age":19,"nation":"Испания","club":"Барселона","value":40.0,"id":"db_0191","ovr":78,"price":751000,"type":"base","stats":{"PAC":75,"SHO":67,"PAS":79,"DRI":76,"DEF":83,"PHY":85},"league":"Испанская Ла Лига"},{"name":"Josh King","pos":"CAM","age":19,"nation":"Англия","club":"Фулхэм","value":40.0,"id":"db_0192","ovr":78,"price":751000,"type":"base","stats":{"PAC":77,"SHO":79,"PAS":86,"DRI":82,"DEF":66,"PHY":71},"league":"Английская Премьер-лига"},{"name":"Christian Kofane","pos":"ST","age":20,"nation":"Камерун","club":"Байер 04 Леверкузен","value":40.0,"id":"db_0193","ovr":78,"price":751000,"type":"base","stats":{"PAC":82,"SHO":86,"PAS":75,"DRI":81,"DEF":58,"PHY":82},"league":"Немецкая Бундеслига"},{"name":"Endrick","pos":"ST","age":20,"nation":"Бразилия","club":"Реал Мадрид","value":40.0,"id":"db_0194","ovr":78,"price":751000,"type":"base","stats":{"PAC":81,"SHO":85,"PAS":74,"DRI":80,"DEF":62,"PHY":81},"league":"Испанская Ла Лига"},{"name":"Senny Mayulu","pos":"CM","age":20,"nation":"Франция / ДР Конго","club":"Пари Сен-Жермен","value":40.0,"id":"db_0195","ovr":78,"price":751000,"type":"base","stats":{"PAC":76,"SHO":75,"PAS":81,"DRI":79,"DEF":78,"PHY":79},"league":"Французская Лига 1"},{"name":"Lucas Bergvall","pos":"CM","age":20,"nation":"Швеция","club":"Тоттенхэм Хотспур","value":40.0,"id":"db_0196","ovr":78,"price":751000,"type":"base","stats":{"PAC":77,"SHO":76,"PAS":82,"DRI":80,"DEF":74,"PHY":80},"league":"Английская Премьер-лига"},{"name":"Gianluca Prestianni","pos":"RW","age":20,"nation":"Аргентина / Италия","club":"Бенфика","value":40.0,"id":"db_0197","ovr":78,"price":751000,"type":"base","stats":{"PAC":85,"SHO":79,"PAS":79,"DRI":86,"DEF":60,"PHY":77},"league":"Португальская Примейра"},{"name":"Jobe Bellingham","pos":"CM","age":21,"nation":"Англия / Ирландия","club":"Боруссия Дортмунд","value":40.0,"id":"db_0198","ovr":78,"price":751000,"type":"base","stats":{"PAC":78,"SHO":72,"PAS":83,"DRI":81,"DEF":75,"PHY":81},"league":"Немецкая Бундеслига"},{"name":"Carlos Espí","pos":"ST","age":21,"nation":"Испания","club":"Реал Мадрид","value":40.0,"id":"db_0199","ovr":78,"price":751000,"type":"base","stats":{"PAC":83,"SHO":82,"PAS":76,"DRI":82,"DEF":59,"PHY":83},"league":"Испанская Ла Лига"},{"name":"Mika Godts","pos":"LW","age":21,"nation":"Бельгия","club":"Пари Сен-Жермен","value":40.0,"id":"db_0200","ovr":78,"price":751000,"type":"base","stats":{"PAC":84,"SHO":83,"PAS":79,"DRI":85,"DEF":59,"PHY":76},"league":"Французская Лига 1"},{"name":"Noah Sadiki","pos":"CM","age":21,"nation":"ДР Конго / Бельгия","club":"Сандерленд","value":40.0,"id":"db_0201","ovr":78,"price":751000,"type":"base","stats":{"PAC":76,"SHO":75,"PAS":81,"DRI":79,"DEF":78,"PHY":79},"league":"Английская Премьер-лига"},{"name":"Valentín Barco","pos":"CM","age":22,"nation":"Аргентина","club":"Челси","value":40.0,"id":"db_0202","ovr":78,"price":751000,"type":"base","stats":{"PAC":77,"SHO":76,"PAS":82,"DRI":80,"DEF":74,"PHY":80},"league":"Английская Премьер-лига"},{"name":"Michael Kayode","pos":"RB","age":22,"nation":"Италия / Нигерия","club":"Брентфорд","value":40.0,"id":"db_0203","ovr":78,"price":751000,"type":"base","stats":{"PAC":81,"SHO":64,"PAS":77,"DRI":77,"DEF":80,"PHY":80},"league":"Английская Премьер-лига"},{"name":"Cristhian Mosquera","pos":"CB","age":22,"nation":"Испания / Колумбия","club":"Арсенал","value":40.0,"id":"db_0204","ovr":78,"price":751000,"type":"base","stats":{"PAC":72,"SHO":59,"PAS":73,"DRI":69,"DEF":88,"PHY":86},"league":"Английская Премьер-лига"},{"name":"Andreas Schjelderup","pos":"LW","age":22,"nation":"Норвегия","club":"Бенфика","value":40.0,"id":"db_0205","ovr":78,"price":751000,"type":"base","stats":{"PAC":82,"SHO":81,"PAS":82,"DRI":83,"DEF":62,"PHY":74},"league":"Португальская Примейра"},{"name":"Samu Aghehowa","pos":"ST","age":22,"nation":"Испания / Нигерия","club":"Порту","value":40.0,"id":"db_0206","ovr":78,"price":751000,"type":"base","stats":{"PAC":80,"SHO":84,"PAS":78,"DRI":79,"DEF":61,"PHY":80},"league":"Португальская Примейра"},{"name":"Alejandro Balde","pos":"LB","age":23,"nation":"Испания","club":"Барселона","value":40.0,"id":"db_0207","ovr":78,"price":751000,"type":"base","stats":{"PAC":83,"SHO":61,"PAS":79,"DRI":74,"DEF":82,"PHY":82},"league":"Испанская Ла Лига"},{"name":"Wesley","pos":"RB","age":23,"nation":"Бразилия","club":"Рома","value":40.0,"id":"db_0208","ovr":78,"price":751000,"type":"base","stats":{"PAC":79,"SHO":62,"PAS":80,"DRI":75,"DEF":83,"PHY":78},"league":"Итальянская Серия А"},{"name":"Víctor Muñoz","pos":"LW","age":23,"nation":"Испания","club":"Ливерпуль","value":40.0,"id":"db_0209","ovr":78,"price":751000,"type":"base","stats":{"PAC":84,"SHO":83,"PAS":79,"DRI":85,"DEF":59,"PHY":76},"league":"Английская Премьер-лига"},{"name":"Xavi Simons","pos":"CAM","age":23,"nation":"Нидерланды / Суринам","club":"Тоттенхэм Хотспур","value":40.0,"id":"db_0210","ovr":78,"price":751000,"type":"base","stats":{"PAC":81,"SHO":78,"PAS":85,"DRI":81,"DEF":65,"PHY":75},"league":"Английская Премьер-лига"},{"name":"Tarik Muharemović","pos":"CB","age":23,"nation":"Босния и Герцеговина / Словения","club":"Лидс Юнайтед","value":40.0,"id":"db_0211","ovr":78,"price":751000,"type":"base","stats":{"PAC":73,"SHO":60,"PAS":74,"DRI":70,"DEF":84,"PHY":87},"league":"Английская Премьер-лига"},{"name":"Liam Delap","pos":"ST","age":23,"nation":"Англия / Ирландия","club":"Ноттингем Форест","value":40.0,"id":"db_0212","ovr":78,"price":751000,"type":"base","stats":{"PAC":84,"SHO":83,"PAS":77,"DRI":78,"DEF":60,"PHY":84},"league":"Английская Премьер-лига"},{"name":"Giuliano Simeone","pos":"RW","age":23,"nation":"Аргентина / Италия","club":"Атлетико Мадрид","value":40.0,"id":"db_0213","ovr":78,"price":751000,"type":"base","stats":{"PAC":85,"SHO":79,"PAS":79,"DRI":86,"DEF":60,"PHY":77},"league":"Испанская Ла Лига"},{"name":"Ilya Zabarnyi","pos":"CB","age":24,"nation":"Украина","club":"Пари Сен-Жермен","value":40.0,"id":"db_0214","ovr":78,"price":751000,"type":"base","stats":{"PAC":71,"SHO":58,"PAS":77,"DRI":68,"DEF":87,"PHY":85},"league":"Французская Лига 1"},{"name":"Bart Verbruggen","pos":"GK","age":24,"nation":"Нидерланды","club":"Брайтон энд Хоув Альбион","value":40.0,"id":"db_0215","ovr":78,"price":751000,"type":"base","stats":{"DIV":81,"HAN":77,"KIC":77,"REF":78,"SPD":73,"POS":81},"league":"Английская Премьер-лига"},{"name":"Nico Williams","pos":"LW","age":24,"nation":"Испания / Гана","club":"Атлетик Бильбао","value":40.0,"id":"db_0216","ovr":78,"price":751000,"type":"base","stats":{"PAC":85,"SHO":79,"PAS":80,"DRI":86,"DEF":60,"PHY":77},"league":"Испанская Ла Лига"},{"name":"Gerard Martín","pos":"CB","age":24,"nation":"Испания","club":"Барселона","value":40.0,"id":"db_0217","ovr":78,"price":751000,"type":"base","stats":{"PAC":74,"SHO":56,"PAS":75,"DRI":71,"DEF":85,"PHY":88},"league":"Испанская Ла Лига"},{"name":"Christos Tzolis","pos":"LW","age":24,"nation":"Греция","club":"Арсенал","value":40.0,"id":"db_0218","ovr":78,"price":751000,"type":"base","stats":{"PAC":84,"SHO":83,"PAS":79,"DRI":85,"DEF":59,"PHY":76},"league":"Английская Премьер-лига"},{"name":"Karim Adeyemi","pos":"RW","age":24,"nation":"Германия / Нигерия","club":"Барселона","value":40.0,"id":"db_0219","ovr":78,"price":751000,"type":"base","stats":{"PAC":86,"SHO":80,"PAS":80,"DRI":82,"DEF":61,"PHY":78},"league":"Испанская Ла Лига"},{"name":"Abde Ezzalzouli","pos":"LW","age":24,"nation":"Марокко / Испания","club":"Бетис","value":40.0,"id":"db_0220","ovr":78,"price":751000,"type":"base","stats":{"PAC":84,"SHO":83,"PAS":79,"DRI":85,"DEF":59,"PHY":76},"league":"Испанская Ла Лига"},{"name":"Mason Greenwood","pos":"RW","age":25,"nation":"Англия / Ямайка","club":"Фенербахче","value":40.0,"id":"db_0221","ovr":78,"price":751000,"type":"base","stats":{"PAC":82,"SHO":81,"PAS":81,"DRI":83,"DEF":62,"PHY":74},"league":"Другие лиги"},{"name":"Amadou Onana","pos":"CDM","age":25,"nation":"Бельгия / Сенегал","club":"Астон Вилла","value":40.0,"id":"db_0222","ovr":78,"price":751000,"type":"base","stats":{"PAC":74,"SHO":66,"PAS":78,"DRI":75,"DEF":87,"PHY":84},"league":"Английская Премьер-лига"},{"name":"Strahinja Pavlović","pos":"CB","age":25,"nation":"Сербия","club":"Милан","value":40.0,"id":"db_0223","ovr":78,"price":751000,"type":"base","stats":{"PAC":72,"SHO":59,"PAS":73,"DRI":69,"DEF":88,"PHY":86},"league":"Итальянская Серия А"},{"name":"Jamie Leweling","pos":"RW","age":25,"nation":"Германия / Гана","club":"Штутгарт","value":40.0,"id":"db_0224","ovr":78,"price":751000,"type":"base","stats":{"PAC":83,"SHO":82,"PAS":77,"DRI":84,"DEF":63,"PHY":75},"league":"Немецкая Бундеслига"},{"name":"João Gomes","pos":"CM","age":25,"nation":"Бразилия","club":"Астон Вилла","value":40.0,"id":"db_0225","ovr":78,"price":751000,"type":"base","stats":{"PAC":77,"SHO":76,"PAS":82,"DRI":80,"DEF":74,"PHY":80},"league":"Английская Премьер-лига"},{"name":"Kaishu Sano","pos":"CDM","age":25,"nation":"Япония","club":"Майнц 05","value":40.0,"id":"db_0226","ovr":78,"price":751000,"type":"base","stats":{"PAC":73,"SHO":65,"PAS":82,"DRI":74,"DEF":86,"PHY":83},"league":"Немецкая Бундеслига"},{"name":"Georges Mikautadze","pos":"ST","age":26,"nation":"Грузия / Франция","club":"Вильярреал","value":40.0,"id":"db_0227","ovr":78,"price":751000,"type":"base","stats":{"PAC":84,"SHO":83,"PAS":77,"DRI":78,"DEF":60,"PHY":84},"league":"Испанская Ла Лига"},{"name":"Josip Stanisic","pos":"RB","age":26,"nation":"Хорватия / Германия","club":"Бавария Мюнхен","value":40.0,"id":"db_0228","ovr":78,"price":751000,"type":"base","stats":{"PAC":81,"SHO":64,"PAS":77,"DRI":77,"DEF":80,"PHY":80},"league":"Немецкая Бундеслига"},{"name":"Antony","pos":"RW","age":26,"nation":"Бразилия","club":"Бетис","value":40.0,"id":"db_0229","ovr":78,"price":751000,"type":"base","stats":{"PAC":82,"SHO":81,"PAS":81,"DRI":83,"DEF":62,"PHY":74},"league":"Испанская Ла Лига"},{"name":"Jakub Kiwior","pos":"CB","age":26,"nation":"Польша","club":"Порту","value":40.0,"id":"db_0230","ovr":78,"price":751000,"type":"base","stats":{"PAC":74,"SHO":56,"PAS":75,"DRI":71,"DEF":85,"PHY":88},"league":"Португальская Примейра"},{"name":"Maxi Araújo","pos":"LB","age":26,"nation":"Уругвай","club":"Спортинг Лиссабон","value":40.0,"id":"db_0231","ovr":78,"price":751000,"type":"base","stats":{"PAC":81,"SHO":64,"PAS":77,"DRI":77,"DEF":80,"PHY":80},"league":"Португальская Примейра"},{"name":"Jørgen Strand Larsen","pos":"ST","age":26,"nation":"Норвегия","club":"Кристал Пэлас","value":40.0,"id":"db_0232","ovr":78,"price":751000,"type":"base","stats":{"PAC":80,"SHO":84,"PAS":78,"DRI":79,"DEF":61,"PHY":80},"league":"Английская Премьер-лига"},{"name":"Francisco Trincão","pos":"RW","age":26,"nation":"Португалия","club":"Аль-Ахли","value":40.0,"id":"db_0233","ovr":78,"price":751000,"type":"base","stats":{"PAC":82,"SHO":81,"PAS":81,"DRI":83,"DEF":62,"PHY":74},"league":"Саудовская Про-лига"},{"name":"Ferdi Kadıoğlu","pos":"LB","age":27,"nation":"Турция / Нидерланды","club":"Брайтон энд Хоув Альбион","value":40.0,"id":"db_0234","ovr":78,"price":751000,"type":"base","stats":{"PAC":81,"SHO":64,"PAS":77,"DRI":77,"DEF":80,"PHY":80},"league":"Английская Премьер-лига"},{"name":"Diogo Costa","pos":"GK","age":27,"nation":"Португалия / Швейцария","club":"Порту","value":40.0,"id":"db_0235","ovr":78,"price":751000,"type":"base","stats":{"DIV":79,"HAN":80,"KIC":75,"REF":81,"SPD":71,"POS":79},"league":"Португальская Примейра"},{"name":"Christoph Baumgartner","pos":"CAM","age":27,"nation":"Австрия","club":"РБ Лейпциг","value":40.0,"id":"db_0236","ovr":78,"price":751000,"type":"base","stats":{"PAC":77,"SHO":79,"PAS":86,"DRI":82,"DEF":66,"PHY":71},"league":"Немецкая Бундеслига"},{"name":"Éderson","pos":"CM","age":27,"nation":"Бразилия","club":"Аталанта","value":40.0,"id":"db_0237","ovr":78,"price":751000,"type":"base","stats":{"PAC":77,"SHO":76,"PAS":82,"DRI":80,"DEF":74,"PHY":80},"league":"Итальянская Серия А"},{"name":"Rafael Leão","pos":"LW","age":27,"nation":"Португалия / Ангола","club":"Галатасарай","value":40.0,"id":"db_0238","ovr":78,"price":751000,"type":"base","stats":{"PAC":84,"SHO":83,"PAS":79,"DRI":85,"DEF":59,"PHY":76},"league":"Другие лиги"},{"name":"Pape Gueye","pos":"CM","age":27,"nation":"Сенегал / Франция","club":"Вильярреал","value":40.0,"id":"db_0239","ovr":78,"price":751000,"type":"base","stats":{"PAC":79,"SHO":73,"PAS":84,"DRI":77,"DEF":76,"PHY":82},"league":"Испанская Ла Лига"},{"name":"Kiernan Dewsbury-Hall","pos":"CAM","age":28,"nation":"Англия / Ирландия","club":"Эвертон","value":40.0,"id":"db_0240","ovr":78,"price":751000,"type":"base","stats":{"PAC":78,"SHO":80,"PAS":82,"DRI":83,"DEF":67,"PHY":72},"league":"Английская Премьер-лига"},{"name":"Cristian Romero","pos":"CB","age":28,"nation":"Аргентина","club":"Атлетико Мадрид","value":40.0,"id":"db_0241","ovr":78,"price":751000,"type":"base","stats":{"PAC":73,"SHO":60,"PAS":74,"DRI":70,"DEF":84,"PHY":87},"league":"Испанская Ла Лига"},{"name":"Gregor Kobel","pos":"GK","age":28,"nation":"Швейцария","club":"Боруссия Дортмунд","value":40.0,"id":"db_0242","ovr":78,"price":751000,"type":"base","stats":{"DIV":79,"HAN":80,"KIC":75,"REF":81,"SPD":71,"POS":79},"league":"Немецкая Бундеслига"},{"name":"Ademola Lookman","pos":"LW","age":29,"nation":"Нигерия / Англия","club":"Атлетико Мадрид","value":40.0,"id":"db_0243","ovr":78,"price":751000,"type":"base","stats":{"PAC":86,"SHO":80,"PAS":81,"DRI":82,"DEF":61,"PHY":78},"league":"Испанская Ла Лига"},{"name":"Youri Tielemans","pos":"CM","age":29,"nation":"Бельгия / ДР Конго","club":"Манчестер Юнайтед","value":40.0,"id":"db_0244","ovr":78,"price":751000,"type":"base","stats":{"PAC":77,"SHO":76,"PAS":82,"DRI":80,"DEF":74,"PHY":80},"league":"Английская Премьер-лига"},{"name":"Scott McTominay","pos":"CM","age":29,"nation":"Шотландия / Англия","club":"Наполи","value":40.0,"id":"db_0245","ovr":78,"price":751000,"type":"base","stats":{"PAC":77,"SHO":76,"PAS":82,"DRI":80,"DEF":74,"PHY":80},"league":"Итальянская Серия А"},{"name":"Rodrigo Mora","pos":"CAM","age":19,"nation":"Португалия","club":"Рома","value":38.0,"id":"db_0246","ovr":77,"price":674000,"type":"base","stats":{"PAC":80,"SHO":77,"PAS":84,"DRI":80,"DEF":64,"PHY":74},"league":"Итальянская Серия А"},{"name":"Vitor Roque","pos":"ST","age":21,"nation":"Бразилия","club":"Палмейрас","value":38.0,"id":"db_0247","ovr":77,"price":674000,"type":"base","stats":{"PAC":79,"SHO":83,"PAS":77,"DRI":78,"DEF":60,"PHY":79},"league":"Бразильская Серия A"},{"name":"Giorgio Scalvini","pos":"CB","age":22,"nation":"Италия","club":"Аталанта","value":38.0,"id":"db_0248","ovr":77,"price":674000,"type":"base","stats":{"PAC":74,"SHO":56,"PAS":75,"DRI":66,"DEF":85,"PHY":88},"league":"Итальянская Серия А"},{"name":"Konstantinos Karetsas","pos":"CAM","age":19,"nation":"Греция / Бельгия","club":"Боруссия Дортмунд","value":35.0,"id":"db_0249","ovr":76,"price":604000,"type":"base","stats":{"PAC":76,"SHO":78,"PAS":80,"DRI":81,"DEF":65,"PHY":70},"league":"Немецкая Бундеслига"},{"name":"Ethan Nwaneri","pos":"CAM","age":19,"nation":"Англия / Нигерия","club":"Боруссия Дортмунд","value":35.0,"id":"db_0250","ovr":76,"price":604000,"type":"base","stats":{"PAC":78,"SHO":75,"PAS":82,"DRI":83,"DEF":62,"PHY":72},"league":"Немецкая Бундеслига"},{"name":"Jaydee Canvot","pos":"CB","age":20,"nation":"Франция / Сенегал","club":"Кристал Пэлас","value":35.0,"id":"db_0251","ovr":76,"price":604000,"type":"base","stats":{"PAC":72,"SHO":54,"PAS":73,"DRI":69,"DEF":83,"PHY":86},"league":"Английская Премьер-лига"},{"name":"Finn Jeltsch","pos":"CB","age":20,"nation":"Германия","club":"Штутгарт","value":35.0,"id":"db_0252","ovr":76,"price":604000,"type":"base","stats":{"PAC":69,"SHO":56,"PAS":75,"DRI":66,"DEF":85,"PHY":83},"league":"Немецкая Бундеслига"},{"name":"Archie Gray","pos":"RB","age":20,"nation":"Англия / Шотландия","club":"Тоттенхэм Хотспур","value":35.0,"id":"db_0253","ovr":76,"price":604000,"type":"base","stats":{"PAC":80,"SHO":58,"PAS":76,"DRI":76,"DEF":79,"PHY":79},"league":"Английская Премьер-лига"},{"name":"Assane Diao","pos":"LW","age":21,"nation":"Сенегал / Испания","club":"Комо 1907","value":35.0,"id":"db_0254","ovr":76,"price":604000,"type":"base","stats":{"PAC":83,"SHO":77,"PAS":78,"DRI":84,"DEF":58,"PHY":75},"league":"Итальянская Серия А"},{"name":"Jack Hinshelwood","pos":"CDM","age":21,"nation":"Англия","club":"Брайтон энд Хоув Альбион","value":35.0,"id":"db_0255","ovr":76,"price":604000,"type":"base","stats":{"PAC":72,"SHO":64,"PAS":76,"DRI":73,"DEF":85,"PHY":82},"league":"Английская Премьер-лига"},{"name":"El Hadji Malick Diouf","pos":"LB","age":21,"nation":"Сенегал","club":"Брентфорд","value":35.0,"id":"db_0256","ovr":76,"price":604000,"type":"base","stats":{"PAC":80,"SHO":58,"PAS":76,"DRI":76,"DEF":79,"PHY":79},"league":"Английская Премьер-лига"},{"name":"Patrick Dorgu","pos":"LW","age":22,"nation":"Дания / Нигерия","club":"Манчестер Юнайтед","value":35.0,"id":"db_0257","ovr":76,"price":604000,"type":"base","stats":{"PAC":80,"SHO":79,"PAS":80,"DRI":81,"DEF":60,"PHY":72},"league":"Английская Премьер-лига"},{"name":"Nicolò Tresoldi","pos":"ST","age":22,"nation":"Германия / Италия","club":"Брюгге","value":35.0,"id":"db_0258","ovr":76,"price":604000,"type":"base","stats":{"PAC":78,"SHO":82,"PAS":76,"DRI":77,"DEF":59,"PHY":78},"league":"Другие лиги"},{"name":"Bilal El Khannouss","pos":"CAM","age":22,"nation":"Марокко / Бельгия","club":"Штутгарт","value":35.0,"id":"db_0259","ovr":76,"price":604000,"type":"base","stats":{"PAC":78,"SHO":75,"PAS":82,"DRI":83,"DEF":62,"PHY":72},"league":"Немецкая Бундеслига"},{"name":"Gonzalo García","pos":"ST","age":22,"nation":"Испания","club":"Фулхэм","value":35.0,"id":"db_0260","ovr":76,"price":604000,"type":"base","stats":{"PAC":80,"SHO":84,"PAS":73,"DRI":79,"DEF":56,"PHY":80},"league":"Английская Премьер-лига"},{"name":"Habib Diarra","pos":"CM","age":22,"nation":"Сенегал / Франция","club":"Сандерленд","value":35.0,"id":"db_0261","ovr":76,"price":604000,"type":"base","stats":{"PAC":75,"SHO":74,"PAS":80,"DRI":78,"DEF":72,"PHY":78},"league":"Английская Премьер-лига"},{"name":"Milos Kerkez","pos":"LB","age":23,"nation":"Венгрия / Сербия","club":"Ливерпуль","value":35.0,"id":"db_0262","ovr":76,"price":604000,"type":"base","stats":{"PAC":80,"SHO":58,"PAS":76,"DRI":76,"DEF":79,"PHY":79},"league":"Английская Премьер-лига"},{"name":"Ange-Yoan Bonny","pos":"ST","age":23,"nation":"Кот-д'Ивуар / Франция","club":"Интернационале","value":35.0,"id":"db_0263","ovr":76,"price":604000,"type":"base","stats":{"PAC":82,"SHO":81,"PAS":75,"DRI":76,"DEF":58,"PHY":82},"league":"Итальянская Серия А"},{"name":"Malo Gusto","pos":"RB","age":23,"nation":"Франция / Мартиника","club":"Челси","value":35.0,"id":"db_0264","ovr":76,"price":604000,"type":"base","stats":{"PAC":77,"SHO":60,"PAS":78,"DRI":73,"DEF":81,"PHY":76},"league":"Английская Премьер-лига"},{"name":"Matías Soulé","pos":"RW","age":23,"nation":"Аргентина / Италия","club":"Рома","value":35.0,"id":"db_0265","ovr":76,"price":604000,"type":"base","stats":{"PAC":84,"SHO":78,"PAS":78,"DRI":80,"DEF":59,"PHY":76},"league":"Итальянская Серия А"},{"name":"Máximo Perrone","pos":"CDM","age":23,"nation":"Аргентина / Испания","club":"Комо 1907","value":35.0,"id":"db_0266","ovr":76,"price":604000,"type":"base","stats":{"PAC":73,"SHO":65,"PAS":77,"DRI":74,"DEF":81,"PHY":83},"league":"Итальянская Серия А"},{"name":"Thierno Barry","pos":"ST","age":24,"nation":"Франция / Гвинея","club":"Эвертон","value":35.0,"id":"db_0267","ovr":76,"price":604000,"type":"base","stats":{"PAC":81,"SHO":80,"PAS":74,"DRI":80,"DEF":57,"PHY":81},"league":"Английская Премьер-лига"},{"name":"Maximilian Beier","pos":"ST","age":24,"nation":"Германия","club":"Боруссия Дортмунд","value":35.0,"id":"db_0268","ovr":76,"price":604000,"type":"base","stats":{"PAC":80,"SHO":84,"PAS":73,"DRI":79,"DEF":56,"PHY":80},"league":"Немецкая Бундеслига"},{"name":"James Trafford","pos":"GK","age":24,"nation":"Англия","club":"Лидс Юнайтед","value":35.0,"id":"db_0269","ovr":76,"price":604000,"type":"base","stats":{"DIV":78,"HAN":74,"KIC":74,"REF":80,"SPD":70,"POS":78},"league":"Английская Премьер-лига"},{"name":"Joaquín Panichelli","pos":"ST","age":24,"nation":"Аргентина","club":"Страсбур","value":35.0,"id":"db_0270","ovr":76,"price":604000,"type":"base","stats":{"PAC":79,"SHO":83,"PAS":72,"DRI":78,"DEF":60,"PHY":79},"league":"Французская Лига 1"},{"name":"Senne Lammens","pos":"GK","age":24,"nation":"Бельгия","club":"Манчестер Юнайтед","value":35.0,"id":"db_0271","ovr":76,"price":604000,"type":"base","stats":{"DIV":78,"HAN":74,"KIC":74,"REF":80,"SPD":70,"POS":78},"league":"Английская Премьер-лига"},{"name":"Gabri Veiga","pos":"CAM","age":24,"nation":"Испания","club":"Порту","value":35.0,"id":"db_0272","ovr":76,"price":604000,"type":"base","stats":{"PAC":78,"SHO":75,"PAS":82,"DRI":83,"DEF":62,"PHY":72},"league":"Португальская Примейра"},{"name":"Tomás Araújo","pos":"CB","age":24,"nation":"Португалия","club":"Бенфика","value":35.0,"id":"db_0273","ovr":76,"price":604000,"type":"base","stats":{"PAC":71,"SHO":58,"PAS":72,"DRI":68,"DEF":82,"PHY":85},"league":"Португальская Примейра"},{"name":"Anthony Elanga","pos":"RW","age":24,"nation":"Швеция / Камерун","club":"Ньюкасл Юнайтед","value":35.0,"id":"db_0274","ovr":76,"price":604000,"type":"base","stats":{"PAC":84,"SHO":78,"PAS":78,"DRI":80,"DEF":59,"PHY":76},"league":"Английская Премьер-лига"},{"name":"Ian Maatsen","pos":"LB","age":24,"nation":"Нидерланды / Суринам","club":"Астон Вилла","value":35.0,"id":"db_0275","ovr":76,"price":604000,"type":"base","stats":{"PAC":77,"SHO":60,"PAS":78,"DRI":73,"DEF":81,"PHY":76},"league":"Английская Премьер-лига"},{"name":"Dango Ouattara","pos":"RW","age":24,"nation":"Буркина-Фасо","club":"Брентфорд","value":35.0,"id":"db_0276","ovr":76,"price":604000,"type":"base","stats":{"PAC":80,"SHO":79,"PAS":79,"DRI":81,"DEF":60,"PHY":72},"league":"Английская Премьер-лига"},{"name":"Adrien Truffert","pos":"LB","age":25,"nation":"Франция / Бельгия","club":"Борнмут","value":35.0,"id":"db_0277","ovr":76,"price":604000,"type":"base","stats":{"PAC":79,"SHO":62,"PAS":75,"DRI":75,"DEF":78,"PHY":78},"league":"Английская Премьер-лига"},{"name":"Gonçalo Inácio","pos":"CB","age":25,"nation":"Португалия","club":"Спортинг Лиссабон","value":35.0,"id":"db_0278","ovr":76,"price":604000,"type":"base","stats":{"PAC":71,"SHO":58,"PAS":72,"DRI":68,"DEF":82,"PHY":85},"league":"Португальская Примейра"},{"name":"Rayan Aït-Nouri","pos":"LB","age":25,"nation":"Алжир / Франция","club":"Манчестер Сити","value":35.0,"id":"db_0279","ovr":76,"price":604000,"type":"base","stats":{"PAC":77,"SHO":60,"PAS":78,"DRI":73,"DEF":81,"PHY":76},"league":"Английская Премьер-лига"},{"name":"Jacob Ramsey","pos":"CM","age":25,"nation":"Англия","club":"Ньюкасл Юнайтед","value":35.0,"id":"db_0280","ovr":76,"price":604000,"type":"base","stats":{"PAC":77,"SHO":71,"PAS":82,"DRI":75,"DEF":74,"PHY":80},"league":"Английская Премьер-лига"},{"name":"Khéphren Thuram","pos":"CM","age":25,"nation":"Франция / Гваделупа","club":"Ювентус","value":35.0,"id":"db_0281","ovr":76,"price":604000,"type":"base","stats":{"PAC":75,"SHO":74,"PAS":80,"DRI":78,"DEF":72,"PHY":78},"league":"Итальянская Серия А"},{"name":"Charles De Ketelaere","pos":"CAM","age":25,"nation":"Бельгия","club":"Аталанта","value":35.0,"id":"db_0282","ovr":76,"price":604000,"type":"base","stats":{"PAC":77,"SHO":79,"PAS":81,"DRI":82,"DEF":61,"PHY":71},"league":"Итальянская Серия А"},{"name":"Kang-in Lee","pos":"CAM","age":25,"nation":"Южная Корея","club":"Атлетико Мадрид","value":35.0,"id":"db_0283","ovr":76,"price":604000,"type":"base","stats":{"PAC":75,"SHO":77,"PAS":84,"DRI":80,"DEF":64,"PHY":69},"league":"Испанская Ла Лига"},{"name":"Curtis Jones","pos":"CM","age":25,"nation":"Англия","club":"Интернационале","value":35.0,"id":"db_0284","ovr":76,"price":604000,"type":"base","stats":{"PAC":76,"SHO":70,"PAS":81,"DRI":79,"DEF":73,"PHY":79},"league":"Итальянская Серия А"},{"name":"Geny Catamo","pos":"RW","age":25,"nation":"Мозамбик","club":"Спортинг Лиссабон","value":35.0,"id":"db_0285","ovr":76,"price":604000,"type":"base","stats":{"PAC":80,"SHO":79,"PAS":79,"DRI":81,"DEF":60,"PHY":72},"league":"Португальская Примейра"},{"name":"Dan Ndoye","pos":"RW","age":26,"nation":"Швейцария / Сенегал","club":"Ноттингем Форест","value":35.0,"id":"db_0286","ovr":76,"price":604000,"type":"base","stats":{"PAC":83,"SHO":77,"PAS":77,"DRI":84,"DEF":58,"PHY":75},"league":"Английская Премьер-лига"},{"name":"Ethan Ampadu","pos":"CDM","age":26,"nation":"Уэльс / Англия","club":"Лидс Юнайтед","value":35.0,"id":"db_0287","ovr":76,"price":604000,"type":"base","stats":{"PAC":74,"SHO":61,"PAS":78,"DRI":75,"DEF":82,"PHY":84},"league":"Английская Премьер-лига"},{"name":"Djed Spence","pos":"RB","age":26,"nation":"Англия / Ямайка","club":"Интернационале","value":35.0,"id":"db_0288","ovr":76,"price":604000,"type":"base","stats":{"PAC":79,"SHO":62,"PAS":75,"DRI":75,"DEF":78,"PHY":78},"league":"Итальянская Серия А"},{"name":"Igor Paixão","pos":"LW","age":26,"nation":"Бразилия","club":"Олимпик Марсель","value":35.0,"id":"db_0289","ovr":76,"price":604000,"type":"base","stats":{"PAC":81,"SHO":80,"PAS":76,"DRI":82,"DEF":61,"PHY":73},"league":"Французская Лига 1"},{"name":"Sven Botman","pos":"CB","age":26,"nation":"Нидерланды","club":"Ньюкасл Юнайтед","value":35.0,"id":"db_0290","ovr":76,"price":604000,"type":"base","stats":{"PAC":69,"SHO":56,"PAS":75,"DRI":66,"DEF":85,"PHY":83},"league":"Английская Премьер-лига"},{"name":"Evanilson","pos":"ST","age":27,"nation":"Бразилия","club":"Борнмут","value":35.0,"id":"db_0291","ovr":76,"price":604000,"type":"base","stats":{"PAC":80,"SHO":84,"PAS":73,"DRI":79,"DEF":56,"PHY":80},"league":"Английская Премьер-лига"},{"name":"Mile Svilar","pos":"GK","age":27,"nation":"Сербия / Бельгия","club":"Рома","value":35.0,"id":"db_0292","ovr":76,"price":604000,"type":"base","stats":{"DIV":77,"HAN":78,"KIC":73,"REF":79,"SPD":69,"POS":77},"league":"Итальянская Серия А"},{"name":"Evan Ndicka","pos":"CB","age":27,"nation":"Кот-д'Ивуар / Франция","club":"Рома","value":35.0,"id":"db_0293","ovr":76,"price":604000,"type":"base","stats":{"PAC":70,"SHO":57,"PAS":71,"DRI":67,"DEF":86,"PHY":84},"league":"Итальянская Серия А"},{"name":"Brahim Díaz","pos":"RW","age":27,"nation":"Марокко / Испания","club":"Реал Мадрид","value":35.0,"id":"db_0294","ovr":76,"price":604000,"type":"base","stats":{"PAC":80,"SHO":79,"PAS":79,"DRI":81,"DEF":60,"PHY":72},"league":"Испанская Ла Лига"},{"name":"Trevoh Chalobah","pos":"CB","age":27,"nation":"Англия / Сьерра-Леоне","club":"Комо 1907","value":35.0,"id":"db_0295","ovr":76,"price":604000,"type":"base","stats":{"PAC":72,"SHO":54,"PAS":73,"DRI":69,"DEF":83,"PHY":86},"league":"Итальянская Серия А"},{"name":"Edmond Tapsoba","pos":"CB","age":27,"nation":"Буркина-Фасо","club":"Байер 04 Леверкузен","value":35.0,"id":"db_0296","ovr":76,"price":604000,"type":"base","stats":{"PAC":72,"SHO":54,"PAS":73,"DRI":69,"DEF":83,"PHY":86},"league":"Немецкая Бундеслига"},{"name":"Vangelis Pavlidis","pos":"ST","age":28,"nation":"Греция","club":"Бенфика","value":35.0,"id":"db_0297","ovr":76,"price":604000,"type":"base","stats":{"PAC":80,"SHO":84,"PAS":73,"DRI":79,"DEF":56,"PHY":80},"league":"Португальская Примейра"},{"name":"Christian Pulisic","pos":"RW","age":28,"nation":"Соединенные Штаты Америки / Хорватия","club":"Милан","value":35.0,"id":"db_0298","ovr":76,"price":604000,"type":"base","stats":{"PAC":82,"SHO":81,"PAS":76,"DRI":83,"DEF":57,"PHY":74},"league":"Итальянская Серия А"},{"name":"Dávid Hancko","pos":"CB","age":28,"nation":"Словакия","club":"Атлетико Мадрид","value":35.0,"id":"db_0299","ovr":76,"price":604000,"type":"base","stats":{"PAC":71,"SHO":58,"PAS":72,"DRI":68,"DEF":82,"PHY":85},"league":"Испанская Ла Лига"},{"name":"Harvey Barnes","pos":"LW","age":28,"nation":"Англия / Шотландия","club":"Ньюкасл Юнайтед","value":35.0,"id":"db_0300","ovr":76,"price":604000,"type":"base","stats":{"PAC":82,"SHO":81,"PAS":77,"DRI":83,"DEF":57,"PHY":74},"league":"Английская Премьер-лига"},{"name":"Marcus Rashford","pos":"LW","age":29,"nation":"Англия / Сент-Китс и Невис","club":"Манчестер Юнайтед","value":35.0,"id":"db_0301","ovr":76,"price":604000,"type":"base","stats":{"PAC":83,"SHO":77,"PAS":78,"DRI":84,"DEF":58,"PHY":75},"league":"Английская Премьер-лига"},{"name":"Ben White","pos":"RB","age":29,"nation":"Англия","club":"Арсенал","value":35.0,"id":"db_0302","ovr":76,"price":604000,"type":"base","stats":{"PAC":77,"SHO":60,"PAS":78,"DRI":73,"DEF":81,"PHY":76},"league":"Английская Премьер-лига"},{"name":"Bremer","pos":"CB","age":29,"nation":"Бразилия","club":"Ювентус","value":35.0,"id":"db_0303","ovr":76,"price":604000,"type":"base","stats":{"PAC":69,"SHO":56,"PAS":75,"DRI":66,"DEF":85,"PHY":83},"league":"Итальянская Серия А"},{"name":"Joshua Kimmich","pos":"CDM","age":31,"nation":"Германия","club":"Бавария Мюнхен","value":35.0,"id":"db_0304","ovr":76,"price":604000,"type":"base","stats":{"PAC":73,"SHO":65,"PAS":77,"DRI":74,"DEF":81,"PHY":83},"league":"Немецкая Бундеслига"},{"name":"Bruno Fernandes","pos":"CAM","age":32,"nation":"Португалия","club":"Манчестер Юнайтед","value":35.0,"id":"db_0305","ovr":76,"price":604000,"type":"base","stats":{"PAC":77,"SHO":79,"PAS":81,"DRI":82,"DEF":61,"PHY":71},"league":"Английская Премьер-лига"},{"name":"Joel Ordóñez","pos":"CB","age":22,"nation":"Эквадор","club":"Брюгге","value":33.0,"id":"db_0306","ovr":75,"price":542000,"type":"base","stats":{"PAC":70,"SHO":57,"PAS":71,"DRI":67,"DEF":81,"PHY":84},"league":"Другие лиги"},{"name":"Jonathan Rowe","pos":"LW","age":23,"nation":"Англия / Ямайка","club":"Аталанта","value":33.0,"id":"db_0307","ovr":75,"price":542000,"type":"base","stats":{"PAC":80,"SHO":79,"PAS":75,"DRI":81,"DEF":60,"PHY":72},"league":"Итальянская Серия А"},{"name":"Kerim Alajbegovic","pos":"LW","age":19,"nation":"Босния и Герцеговина / Германия","club":"Ювентус","value":32.0,"id":"db_0308","ovr":75,"price":542000,"type":"base","stats":{"PAC":83,"SHO":77,"PAS":78,"DRI":79,"DEF":58,"PHY":75},"league":"Итальянская Серия А"},{"name":"Aleksandar Stanković","pos":"CDM","age":21,"nation":"Сербия / Италия","club":"Интернационале","value":32.0,"id":"db_0309","ovr":75,"price":542000,"type":"base","stats":{"PAC":72,"SHO":64,"PAS":76,"DRI":73,"DEF":80,"PHY":82},"league":"Итальянская Серия А"},{"name":"Santiago Castro","pos":"ST","age":22,"nation":"Аргентина / Италия","club":"Рома","value":32.0,"id":"db_0310","ovr":75,"price":542000,"type":"base","stats":{"PAC":78,"SHO":82,"PAS":71,"DRI":77,"DEF":59,"PHY":78},"league":"Итальянская Серия А"},{"name":"Yegor Yarmolyuk","pos":"CM","age":22,"nation":"Украина","club":"Брентфорд","value":32.0,"id":"db_0311","ovr":75,"price":542000,"type":"base","stats":{"PAC":73,"SHO":72,"PAS":78,"DRI":76,"DEF":75,"PHY":76},"league":"Английская Премьер-лига"},{"name":"William Osula","pos":"ST","age":23,"nation":"Дания / Англия","club":"Ньюкасл Юнайтед","value":32.0,"id":"db_0312","ovr":75,"price":542000,"type":"base","stats":{"PAC":79,"SHO":83,"PAS":72,"DRI":78,"DEF":55,"PHY":79},"league":"Английская Премьер-лига"},{"name":"Hayden Hackney","pos":"CDM","age":24,"nation":"Англия / Шотландия","club":"Эвертон","value":32.0,"id":"db_0313","ovr":75,"price":542000,"type":"base","stats":{"PAC":70,"SHO":62,"PAS":79,"DRI":71,"DEF":83,"PHY":80},"league":"Английская Премьер-лига"},{"name":"Sepp van den Berg","pos":"CB","age":24,"nation":"Нидерланды","club":"Брентфорд","value":32.0,"id":"db_0314","ovr":75,"price":542000,"type":"base","stats":{"PAC":70,"SHO":57,"PAS":71,"DRI":67,"DEF":81,"PHY":84},"league":"Английская Премьер-лига"},{"name":"Danilo","pos":"CM","age":25,"nation":"Бразилия","club":"Ботафого","value":32.0,"id":"db_0315","ovr":75,"price":542000,"type":"base","stats":{"PAC":73,"SHO":72,"PAS":78,"DRI":76,"DEF":75,"PHY":76},"league":"Бразильская Серия A"},{"name":"Neco Williams","pos":"LB","age":25,"nation":"Уэльс","club":"Ноттингем Форест","value":32.0,"id":"db_0316","ovr":75,"price":542000,"type":"base","stats":{"PAC":80,"SHO":58,"PAS":76,"DRI":71,"DEF":79,"PHY":79},"league":"Английская Премьер-лига"},{"name":"Wesley Fofana","pos":"CB","age":25,"nation":"Франция / Кот-д'Ивуар","club":"Челси","value":32.0,"id":"db_0317","ovr":75,"price":542000,"type":"base","stats":{"PAC":71,"SHO":53,"PAS":72,"DRI":68,"DEF":82,"PHY":85},"league":"Английская Премьер-лига"},{"name":"Pierre Kalulu","pos":"CB","age":26,"nation":"Франция / ДР Конго","club":"Ювентус","value":32.0,"id":"db_0318","ovr":75,"price":542000,"type":"base","stats":{"PAC":72,"SHO":54,"PAS":73,"DRI":64,"DEF":83,"PHY":86},"league":"Итальянская Серия А"},{"name":"Noah Okafor","pos":"LW","age":26,"nation":"Швейцария / Нигерия","club":"Лидс Юнайтед","value":32.0,"id":"db_0319","ovr":75,"price":542000,"type":"base","stats":{"PAC":79,"SHO":78,"PAS":79,"DRI":80,"DEF":59,"PHY":71},"league":"Английская Премьер-лига"},{"name":"Moise Kean","pos":"ST","age":26,"nation":"Италия / Кот-д'Ивуар","club":"Комо 1907","value":32.0,"id":"db_0320","ovr":75,"price":542000,"type":"base","stats":{"PAC":79,"SHO":83,"PAS":72,"DRI":78,"DEF":55,"PHY":79},"league":"Итальянская Серия А"},{"name":"Conor Gallagher","pos":"CM","age":26,"nation":"Англия","club":"Тоттенхэм Хотспур","value":32.0,"id":"db_0321","ovr":75,"price":542000,"type":"base","stats":{"PAC":75,"SHO":69,"PAS":80,"DRI":78,"DEF":72,"PHY":78},"league":"Английская Премьер-лига"},{"name":"Dušan Vlahović","pos":"ST","age":26,"nation":"Сербия","club":"Бешикташ","value":32.0,"id":"db_0322","ovr":75,"price":542000,"type":"base","stats":{"PAC":79,"SHO":83,"PAS":72,"DRI":78,"DEF":55,"PHY":79},"league":"Другие лиги"},{"name":"Caoimhín Kelleher","pos":"GK","age":27,"nation":"Ирландия","club":"Брентфорд","value":32.0,"id":"db_0323","ovr":75,"price":542000,"type":"base","stats":{"DIV":77,"HAN":73,"KIC":73,"REF":79,"SPD":69,"POS":77},"league":"Английская Премьер-лига"},{"name":"Anton Stach","pos":"CDM","age":28,"nation":"Германия","club":"Лидс Юнайтед","value":32.0,"id":"db_0324","ovr":75,"price":542000,"type":"base","stats":{"PAC":72,"SHO":64,"PAS":76,"DRI":73,"DEF":80,"PHY":82},"league":"Английская Премьер-лига"},{"name":"Konrad Laimer","pos":"RB","age":29,"nation":"Австрия","club":"Бавария Мюнхен","value":32.0,"id":"db_0325","ovr":75,"price":542000,"type":"base","stats":{"PAC":80,"SHO":58,"PAS":76,"DRI":71,"DEF":79,"PHY":79},"league":"Немецкая Бундеслига"},{"name":"Serhou Guirassy","pos":"ST","age":30,"nation":"Гвинея / Франция","club":"Боруссия Дортмунд","value":32.0,"id":"db_0326","ovr":75,"price":542000,"type":"base","stats":{"PAC":79,"SHO":83,"PAS":72,"DRI":78,"DEF":55,"PHY":79},"league":"Немецкая Бундеслига"},{"name":"Harrison Armstrong","pos":"CM","age":19,"nation":"Англия","club":"Эвертон","value":30.0,"id":"db_0327","ovr":74,"price":486000,"type":"base","stats":{"PAC":73,"SHO":72,"PAS":78,"DRI":76,"DEF":70,"PHY":76},"league":"Английская Премьер-лига"},{"name":"Ayden Heaven","pos":"CB","age":20,"nation":"Англия / Гана","club":"Манчестер Юнайтед","value":30.0,"id":"db_0328","ovr":74,"price":486000,"type":"base","stats":{"PAC":70,"SHO":52,"PAS":71,"DRI":67,"DEF":81,"PHY":84},"league":"Английская Премьер-лига"},{"name":"Givairo Read","pos":"RB","age":20,"nation":"Нидерланды / Суринам","club":"Фейеноорд Роттердам","value":30.0,"id":"db_0329","ovr":74,"price":486000,"type":"base","stats":{"PAC":78,"SHO":56,"PAS":74,"DRI":74,"DEF":77,"PHY":77},"league":"Нидерландская Эредивизи"},{"name":"Josh Acheampong","pos":"CB","age":20,"nation":"Англия / Гана","club":"Челси","value":30.0,"id":"db_0330","ovr":74,"price":486000,"type":"base","stats":{"PAC":69,"SHO":56,"PAS":70,"DRI":66,"DEF":80,"PHY":83},"league":"Английская Премьер-лига"},{"name":"Lewis Miley","pos":"CM","age":20,"nation":"Англия","club":"Ньюкасл Юнайтед","value":30.0,"id":"db_0331","ovr":74,"price":486000,"type":"base","stats":{"PAC":71,"SHO":70,"PAS":81,"DRI":74,"DEF":73,"PHY":74},"league":"Английская Премьер-лига"},{"name":"William Gomes","pos":"RW","age":20,"nation":"Бразилия","club":"Порту","value":30.0,"id":"db_0332","ovr":74,"price":486000,"type":"base","stats":{"PAC":80,"SHO":79,"PAS":74,"DRI":81,"DEF":55,"PHY":72},"league":"Португальская Примейра"},{"name":"Vitor Reis","pos":"CB","age":20,"nation":"Бразилия","club":"Манчестер Сити","value":30.0,"id":"db_0333","ovr":74,"price":486000,"type":"base","stats":{"PAC":70,"SHO":52,"PAS":71,"DRI":67,"DEF":81,"PHY":84},"league":"Английская Премьер-лига"},{"name":"Jesús Rodríguez","pos":"LW","age":21,"nation":"Испания","club":"Комо 1907","value":30.0,"id":"db_0334","ovr":74,"price":486000,"type":"base","stats":{"PAC":78,"SHO":77,"PAS":78,"DRI":79,"DEF":58,"PHY":70},"league":"Итальянская Серия А"},{"name":"Malick Fofana","pos":"LW","age":21,"nation":"Бельгия / Гвинея","club":"Сандерленд","value":30.0,"id":"db_0335","ovr":74,"price":486000,"type":"base","stats":{"PAC":81,"SHO":75,"PAS":76,"DRI":82,"DEF":56,"PHY":73},"league":"Английская Премьер-лига"},{"name":"Afonso Moreira","pos":"LW","age":21,"nation":"Португалия","club":"Байер 04 Леверкузен","value":30.0,"id":"db_0336","ovr":74,"price":486000,"type":"base","stats":{"PAC":80,"SHO":79,"PAS":75,"DRI":81,"DEF":55,"PHY":72},"league":"Немецкая Бундеслига"},{"name":"Ismaëlo Ganiou","pos":"CB","age":21,"nation":"Франция / Буркина-Фасо","club":"Ланс","value":30.0,"id":"db_0337","ovr":74,"price":486000,"type":"base","stats":{"PAC":69,"SHO":56,"PAS":70,"DRI":66,"DEF":80,"PHY":83},"league":"Французская Лига 1"},{"name":"Robin Risser","pos":"GK","age":21,"nation":"Франция","club":"Ланс","value":30.0,"id":"db_0338","ovr":74,"price":486000,"type":"base","stats":{"DIV":76,"HAN":72,"KIC":72,"REF":78,"SPD":68,"POS":76},"league":"Французская Лига 1"},{"name":"Niccolò Pisilli","pos":"CM","age":22,"nation":"Италия","club":"Рома","value":30.0,"id":"db_0339","ovr":74,"price":486000,"type":"base","stats":{"PAC":72,"SHO":71,"PAS":77,"DRI":75,"DEF":74,"PHY":75},"league":"Итальянская Серия А"},{"name":"Allan","pos":"RW","age":22,"nation":"Бразилия","club":"Манчестер Сити","value":30.0,"id":"db_0340","ovr":74,"price":486000,"type":"base","stats":{"PAC":80,"SHO":79,"PAS":74,"DRI":81,"DEF":55,"PHY":72},"league":"Английская Премьер-лига"},{"name":"Leon Avdullahu","pos":"CDM","age":22,"nation":"Косово / Швейцария","club":"Хоффенхайм","value":30.0,"id":"db_0341","ovr":74,"price":486000,"type":"base","stats":{"PAC":72,"SHO":59,"PAS":76,"DRI":73,"DEF":80,"PHY":82},"league":"Немецкая Бундеслига"},{"name":"Julio Enciso","pos":"CAM","age":22,"nation":"Парагвай","club":"Ипсвич Таун","value":30.0,"id":"db_0342","ovr":74,"price":486000,"type":"base","stats":{"PAC":76,"SHO":73,"PAS":80,"DRI":81,"DEF":60,"PHY":70},"league":"Английская Премьер-лига"},{"name":"António Silva","pos":"CB","age":23,"nation":"Португалия","club":"Борнмут","value":30.0,"id":"db_0343","ovr":74,"price":486000,"type":"base","stats":{"PAC":67,"SHO":54,"PAS":73,"DRI":64,"DEF":83,"PHY":81},"league":"Английская Премьер-лига"},{"name":"Omari Hutchinson","pos":"RW","age":23,"nation":"Англия / Ямайка","club":"Милан","value":30.0,"id":"db_0344","ovr":74,"price":486000,"type":"base","stats":{"PAC":81,"SHO":75,"PAS":75,"DRI":82,"DEF":56,"PHY":73},"league":"Итальянская Серия А"},{"name":"Renato Veiga","pos":"CB","age":23,"nation":"Португалия / Кабо-Верде","club":"Вильярреал","value":30.0,"id":"db_0345","ovr":74,"price":486000,"type":"base","stats":{"PAC":69,"SHO":56,"PAS":70,"DRI":66,"DEF":80,"PHY":83},"league":"Испанская Ла Лига"},{"name":"Andy Diouf","pos":"CM","age":23,"nation":"Франция / Сенегал","club":"Интернационале","value":30.0,"id":"db_0346","ovr":74,"price":486000,"type":"base","stats":{"PAC":73,"SHO":72,"PAS":78,"DRI":76,"DEF":70,"PHY":76},"league":"Итальянская Серия А"},{"name":"Hákon Arnar Haraldsson","pos":"CAM","age":23,"nation":"Исландия","club":"Лилль","value":30.0,"id":"db_0347","ovr":74,"price":486000,"type":"base","stats":{"PAC":77,"SHO":74,"PAS":81,"DRI":77,"DEF":61,"PHY":71},"league":"Французская Лига 1"},{"name":"Igor Matanovic","pos":"ST","age":23,"nation":"Хорватия / Германия","club":"Фрайбург","value":30.0,"id":"db_0348","ovr":74,"price":486000,"type":"base","stats":{"PAC":78,"SHO":82,"PAS":71,"DRI":77,"DEF":54,"PHY":78},"league":"Немецкая Бундеслига"},{"name":"Diego Gómez","pos":"CM","age":23,"nation":"Парагвай","club":"Брайтон энд Хоув Альбион","value":30.0,"id":"db_0349","ovr":74,"price":486000,"type":"base","stats":{"PAC":72,"SHO":71,"PAS":77,"DRI":75,"DEF":74,"PHY":75},"league":"Английская Премьер-лига"},{"name":"Robin Roefs","pos":"GK","age":23,"nation":"Нидерланды","club":"Сандерленд","value":30.0,"id":"db_0350","ovr":74,"price":486000,"type":"base","stats":{"DIV":76,"HAN":72,"KIC":72,"REF":78,"SPD":68,"POS":76},"league":"Английская Премьер-лига"},{"name":"Ricardo Pepi","pos":"ST","age":23,"nation":"Соединенные Штаты Америки / Мексика","club":"ПСВ Эйндховен","value":30.0,"id":"db_0351","ovr":74,"price":486000,"type":"base","stats":{"PAC":77,"SHO":81,"PAS":70,"DRI":76,"DEF":58,"PHY":77},"league":"Нидерландская Эредивизи"},{"name":"Francisco Conceição","pos":"RW","age":23,"nation":"Португалия","club":"Ювентус","value":30.0,"id":"db_0352","ovr":74,"price":486000,"type":"base","stats":{"PAC":80,"SHO":79,"PAS":74,"DRI":81,"DEF":55,"PHY":72},"league":"Итальянская Серия А"},{"name":"Tyler Morton","pos":"CDM","age":24,"nation":"Англия","club":"Олимпик Лион","value":30.0,"id":"db_0353","ovr":74,"price":486000,"type":"base","stats":{"PAC":73,"SHO":60,"PAS":77,"DRI":69,"DEF":81,"PHY":83},"league":"Французская Лига 1"},{"name":"Yéremy Pino","pos":"LW","age":24,"nation":"Испания","club":"Кристал Пэлас","value":30.0,"id":"db_0354","ovr":74,"price":486000,"type":"base","stats":{"PAC":81,"SHO":75,"PAS":76,"DRI":82,"DEF":56,"PHY":73},"league":"Английская Премьер-лига"},{"name":"Guéla Doué","pos":"RB","age":24,"nation":"Кот-д'Ивуар / Франция","club":"Байер 04 Леверкузен","value":30.0,"id":"db_0355","ovr":74,"price":486000,"type":"base","stats":{"PAC":76,"SHO":59,"PAS":72,"DRI":72,"DEF":80,"PHY":75},"league":"Немецкая Бундеслига"},{"name":"Pape Matar Sarr","pos":"CM","age":24,"nation":"Сенегал","club":"Ювентус","value":30.0,"id":"db_0356","ovr":74,"price":486000,"type":"base","stats":{"PAC":73,"SHO":72,"PAS":78,"DRI":76,"DEF":70,"PHY":76},"league":"Итальянская Серия А"},{"name":"Zion Suzuki","pos":"GK","age":24,"nation":"Япония / Соединенные Штаты Америки","club":"Астон Вилла","value":30.0,"id":"db_0357","ovr":74,"price":486000,"type":"base","stats":{"DIV":75,"HAN":76,"KIC":71,"REF":77,"SPD":67,"POS":75},"league":"Английская Премьер-лига"},{"name":"Amar Dedic","pos":"RB","age":24,"nation":"Босния и Герцеговина","club":"Ньюкасл Юнайтед","value":30.0,"id":"db_0358","ovr":74,"price":486000,"type":"base","stats":{"PAC":78,"SHO":56,"PAS":74,"DRI":74,"DEF":77,"PHY":77},"league":"Английская Премьер-лига"},{"name":"Fisnik Asllani","pos":"ST","age":24,"nation":"Косово / Германия","club":"Хоффенхайм","value":30.0,"id":"db_0359","ovr":74,"price":486000,"type":"base","stats":{"PAC":79,"SHO":78,"PAS":72,"DRI":78,"DEF":55,"PHY":79},"league":"Немецкая Бундеслига"},{"name":"Malik Tillman","pos":"CAM","age":24,"nation":"Соединенные Штаты Америки / Германия","club":"Байер 04 Леверкузен","value":30.0,"id":"db_0360","ovr":74,"price":486000,"type":"base","stats":{"PAC":76,"SHO":73,"PAS":80,"DRI":81,"DEF":60,"PHY":70},"league":"Немецкая Бундеслига"},{"name":"Georginio Rutter","pos":"ST","age":24,"nation":"Франция / Мартиника","club":"Брайтон энд Хоув Альбион","value":30.0,"id":"db_0361","ovr":74,"price":486000,"type":"base","stats":{"PAC":79,"SHO":78,"PAS":72,"DRI":78,"DEF":55,"PHY":79},"league":"Английская Премьер-лига"},{"name":"Rômulo","pos":"ST","age":24,"nation":"Бразилия","club":"РБ Лейпциг","value":30.0,"id":"db_0362","ovr":74,"price":486000,"type":"base","stats":{"PAC":79,"SHO":78,"PAS":72,"DRI":78,"DEF":55,"PHY":79},"league":"Немецкая Бундеслига"},{"name":"James Hill","pos":"CB","age":24,"nation":"Англия","club":"Борнмут","value":30.0,"id":"db_0363","ovr":74,"price":486000,"type":"base","stats":{"PAC":68,"SHO":55,"PAS":69,"DRI":65,"DEF":84,"PHY":82},"league":"Английская Премьер-лига"},{"name":"Neil El Aynaoui","pos":"CM","age":25,"nation":"Марокко / Франция","club":"РБ Лейпциг","value":30.0,"id":"db_0364","ovr":74,"price":486000,"type":"base","stats":{"PAC":74,"SHO":68,"PAS":79,"DRI":77,"DEF":71,"PHY":77},"league":"Немецкая Бундеслига"},{"name":"Lucas Da Cunha","pos":"CM","age":25,"nation":"Франция / Португалия","club":"Комо 1907","value":30.0,"id":"db_0365","ovr":74,"price":486000,"type":"base","stats":{"PAC":71,"SHO":70,"PAS":81,"DRI":74,"DEF":73,"PHY":74},"league":"Итальянская Серия А"},{"name":"Nathan Collins","pos":"CB","age":25,"nation":"Ирландия","club":"Брентфорд","value":30.0,"id":"db_0366","ovr":74,"price":486000,"type":"base","stats":{"PAC":69,"SHO":56,"PAS":70,"DRI":66,"DEF":80,"PHY":83},"league":"Английская Премьер-лига"},{"name":"Keane Lewis-Potter","pos":"LB","age":25,"nation":"Англия","club":"Брентфорд","value":30.0,"id":"db_0367","ovr":74,"price":486000,"type":"base","stats":{"PAC":77,"SHO":60,"PAS":73,"DRI":73,"DEF":76,"PHY":76},"league":"Английская Премьер-лига"},{"name":"Natan","pos":"CB","age":25,"nation":"Бразилия","club":"Бетис","value":30.0,"id":"db_0368","ovr":74,"price":486000,"type":"base","stats":{"PAC":70,"SHO":52,"PAS":71,"DRI":67,"DEF":81,"PHY":84},"league":"Испанская Ла Лига"},{"name":"Maxim De Cuyper","pos":"LB","age":25,"nation":"Бельгия","club":"Брайтон энд Хоув Альбион","value":30.0,"id":"db_0369","ovr":74,"price":486000,"type":"base","stats":{"PAC":78,"SHO":56,"PAS":74,"DRI":74,"DEF":77,"PHY":77},"league":"Английская Премьер-лига"},{"name":"Jeremie Frimpong","pos":"RB","age":25,"nation":"Нидерланды / Гана","club":"Ливерпуль","value":30.0,"id":"db_0370","ovr":74,"price":486000,"type":"base","stats":{"PAC":75,"SHO":58,"PAS":76,"DRI":71,"DEF":79,"PHY":74},"league":"Английская Премьер-лига"},{"name":"José Manuel López","pos":"ST","age":25,"nation":"Аргентина","club":"Палмейрас","value":30.0,"id":"db_0371","ovr":74,"price":486000,"type":"base","stats":{"PAC":79,"SHO":78,"PAS":72,"DRI":78,"DEF":55,"PHY":79},"league":"Бразильская Серия A"},{"name":"Mario Gila","pos":"CB","age":26,"nation":"Испания","club":"Милан","value":30.0,"id":"db_0372","ovr":74,"price":486000,"type":"base","stats":{"PAC":69,"SHO":56,"PAS":70,"DRI":66,"DEF":80,"PHY":83},"league":"Итальянская Серия А"},{"name":"Jonathan Burkardt","pos":"ST","age":26,"nation":"Германия","club":"Айнтрахт Франкфурт","value":30.0,"id":"db_0373","ovr":74,"price":486000,"type":"base","stats":{"PAC":80,"SHO":79,"PAS":73,"DRI":74,"DEF":56,"PHY":80},"league":"Немецкая Бундеслига"},{"name":"Mikkel Damsgaard","pos":"CAM","age":26,"nation":"Дания","club":"Брентфорд","value":30.0,"id":"db_0374","ovr":74,"price":486000,"type":"base","stats":{"PAC":74,"SHO":76,"PAS":78,"DRI":79,"DEF":63,"PHY":68},"league":"Английская Премьер-лига"},{"name":"Marco Carnesecchi","pos":"GK","age":26,"nation":"Италия","club":"Аталанта","value":30.0,"id":"db_0375","ovr":74,"price":486000,"type":"base","stats":{"DIV":74,"HAN":75,"KIC":70,"REF":76,"SPD":71,"POS":74},"league":"Итальянская Серия А"},{"name":"Barış Alper Yılmaz","pos":"LW","age":26,"nation":"Турция","club":"Галатасарай","value":30.0,"id":"db_0376","ovr":74,"price":486000,"type":"base","stats":{"PAC":78,"SHO":77,"PAS":78,"DRI":79,"DEF":58,"PHY":70},"league":"Другие лиги"},{"name":"Nikola Krstović","pos":"ST","age":26,"nation":"Черногория / Сербия","club":"Аталанта","value":30.0,"id":"db_0377","ovr":74,"price":486000,"type":"base","stats":{"PAC":76,"SHO":80,"PAS":74,"DRI":75,"DEF":57,"PHY":76},"league":"Итальянская Серия А"},{"name":"Amine Gouiri","pos":"ST","age":26,"nation":"Алжир / Франция","club":"Олимпик Марсель","value":30.0,"id":"db_0378","ovr":74,"price":486000,"type":"base","stats":{"PAC":77,"SHO":81,"PAS":70,"DRI":76,"DEF":58,"PHY":77},"league":"Французская Лига 1"},{"name":"Enzo Le Fée","pos":"CM","age":26,"nation":"Франция","club":"Сандерленд","value":30.0,"id":"db_0379","ovr":74,"price":486000,"type":"base","stats":{"PAC":73,"SHO":72,"PAS":78,"DRI":76,"DEF":70,"PHY":76},"league":"Английская Премьер-лига"},{"name":"Jonathan David","pos":"ST","age":26,"nation":"Канада / Соединенные Штаты Америки","club":"Атлетико Мадрид","value":30.0,"id":"db_0380","ovr":74,"price":486000,"type":"base","stats":{"PAC":80,"SHO":79,"PAS":73,"DRI":74,"DEF":56,"PHY":80},"league":"Испанская Ла Лига"},{"name":"Rodrigo Zalazar","pos":"CAM","age":27,"nation":"Уругвай / Испания","club":"Спортинг Лиссабон","value":30.0,"id":"db_0381","ovr":74,"price":486000,"type":"base","stats":{"PAC":76,"SHO":73,"PAS":80,"DRI":81,"DEF":60,"PHY":70},"league":"Португальская Примейра"},{"name":"Mateo Retegui","pos":"ST","age":27,"nation":"Италия / Аргентина","club":"Аль-Кадсия Эль-Хубар","value":30.0,"id":"db_0382","ovr":74,"price":486000,"type":"base","stats":{"PAC":79,"SHO":78,"PAS":72,"DRI":78,"DEF":55,"PHY":79},"league":"Саудовская Про-лига"},{"name":"Marcus Tavernier","pos":"CAM","age":27,"nation":"Англия","club":"Борнмут","value":30.0,"id":"db_0383","ovr":74,"price":486000,"type":"base","stats":{"PAC":76,"SHO":73,"PAS":80,"DRI":81,"DEF":60,"PHY":70},"league":"Английская Премьер-лига"},{"name":"Diogo Dalot","pos":"RB","age":27,"nation":"Португалия","club":"Манчестер Юнайтед","value":30.0,"id":"db_0384","ovr":74,"price":486000,"type":"base","stats":{"PAC":78,"SHO":56,"PAS":74,"DRI":74,"DEF":77,"PHY":77},"league":"Английская Премьер-лига"},{"name":"Matvey Safonov","pos":"GK","age":27,"nation":"Россия","club":"Пари Сен-Жермен","value":30.0,"id":"db_0385","ovr":74,"price":486000,"type":"base","stats":{"DIV":76,"HAN":72,"KIC":72,"REF":78,"SPD":68,"POS":76},"league":"Французская Лига 1"},{"name":"Tyler Adams","pos":"CDM","age":27,"nation":"Соединенные Штаты Америки","club":"Борнмут","value":30.0,"id":"db_0386","ovr":74,"price":486000,"type":"base","stats":{"PAC":69,"SHO":61,"PAS":78,"DRI":70,"DEF":82,"PHY":79},"league":"Английская Премьер-лига"},{"name":"Randal Kolo Muani","pos":"ST","age":27,"nation":"Франция / ДР Конго","club":"Ювентус","value":30.0,"id":"db_0387","ovr":74,"price":486000,"type":"base","stats":{"PAC":79,"SHO":78,"PAS":72,"DRI":78,"DEF":55,"PHY":79},"league":"Итальянская Серия А"},{"name":"Weston McKennie","pos":"CM","age":28,"nation":"Соединенные Штаты Америки","club":"Ювентус","value":30.0,"id":"db_0388","ovr":74,"price":486000,"type":"base","stats":{"PAC":74,"SHO":68,"PAS":79,"DRI":77,"DEF":71,"PHY":77},"league":"Итальянская Серия А"},{"name":"Luis Suárez","pos":"ST","age":28,"nation":"Колумбия / Испания","club":"Спортинг Лиссабон","value":30.0,"id":"db_0389","ovr":74,"price":486000,"type":"base","stats":{"PAC":76,"SHO":80,"PAS":74,"DRI":75,"DEF":57,"PHY":76},"league":"Португальская Примейра"},{"name":"Jean-Philippe Mateta","pos":"ST","age":29,"nation":"Франция / ДР Конго","club":"Кристал Пэлас","value":30.0,"id":"db_0390","ovr":74,"price":486000,"type":"base","stats":{"PAC":78,"SHO":82,"PAS":71,"DRI":77,"DEF":54,"PHY":78},"league":"Английская Премьер-лига"},{"name":"Jarrod Bowen","pos":"RW","age":29,"nation":"Англия","club":"Вест Хэм Юнайтед","value":30.0,"id":"db_0391","ovr":74,"price":486000,"type":"base","stats":{"PAC":81,"SHO":75,"PAS":75,"DRI":82,"DEF":56,"PHY":73},"league":"Английская Премьер-лига"},{"name":"Fabián Ruiz","pos":"CM","age":30,"nation":"Испания","club":"Пари Сен-Жермен","value":30.0,"id":"db_0392","ovr":74,"price":486000,"type":"base","stats":{"PAC":74,"SHO":68,"PAS":79,"DRI":77,"DEF":71,"PHY":77},"league":"Французская Лига 1"},{"name":"David Raya","pos":"GK","age":31,"nation":"Испания","club":"Арсенал","value":30.0,"id":"db_0393","ovr":74,"price":486000,"type":"base","stats":{"DIV":75,"HAN":76,"KIC":71,"REF":77,"SPD":67,"POS":75},"league":"Английская Премьер-лига"},{"name":"Karim Coulibaly","pos":"CB","age":19,"nation":"Германия / Кот-д'Ивуар","club":"Страсбур","value":28.0,"id":"db_0394","ovr":72,"price":391000,"type":"base","stats":{"PAC":68,"SHO":50,"PAS":69,"DRI":65,"DEF":79,"PHY":82},"league":"Французская Лига 1"},{"name":"Joane Gadou","pos":"CB","age":19,"nation":"Франция / Кот-д'Ивуар","club":"Боруссия Дортмунд","value":28.0,"id":"db_0395","ovr":72,"price":391000,"type":"base","stats":{"PAC":68,"SHO":50,"PAS":69,"DRI":65,"DEF":79,"PHY":82},"league":"Немецкая Бундеслига"},{"name":"Christ Inao Oulaï","pos":"CM","age":20,"nation":"Кот-д'Ивуар","club":"Фиорентина","value":28.0,"id":"db_0396","ovr":72,"price":391000,"type":"base","stats":{"PAC":72,"SHO":66,"PAS":77,"DRI":75,"DEF":69,"PHY":75},"league":"Итальянская Серия А"},{"name":"Aleksey Batrakov","pos":"CAM","age":21,"nation":"Россия","club":"Галатасарай","value":32.0,"id":"db_0397","ovr":78,"price":1050000,"type":"base","stats":{"PAC":78,"SHO":76,"PAS":83,"DRI":82,"DEF":60,"PHY":70},"league":"Другие лиги"},{"name":"Brajan Gruda","pos":"CAM","age":22,"nation":"Германия / Албания","club":"РБ Лейпциг","value":28.0,"id":"db_0398","ovr":72,"price":391000,"type":"base","stats":{"PAC":74,"SHO":71,"PAS":78,"DRI":79,"DEF":58,"PHY":68},"league":"Немецкая Бундеслига"},{"name":"Oscar Bobb","pos":"RW","age":23,"nation":"Норвегия / Гамбия","club":"Фулхэм","value":28.0,"id":"db_0399","ovr":72,"price":391000,"type":"base","stats":{"PAC":79,"SHO":73,"PAS":73,"DRI":80,"DEF":54,"PHY":71},"league":"Английская Премьер-лига"},{"name":"Alisson Santos","pos":"LW","age":24,"nation":"Бразилия / Тунис","club":"Наполи","value":28.0,"id":"db_0400","ovr":72,"price":391000,"type":"base","stats":{"PAC":78,"SHO":77,"PAS":73,"DRI":79,"DEF":53,"PHY":70},"league":"Итальянская Серия А"},{"name":"Dilane Bakwa","pos":"RW","age":24,"nation":"Франция / ДР Конго","club":"Лилль","value":28.0,"id":"db_0401","ovr":72,"price":391000,"type":"base","stats":{"PAC":79,"SHO":73,"PAS":73,"DRI":80,"DEF":54,"PHY":71},"league":"Французская Лига 1"},{"name":"Matteo Ruggeri","pos":"LB","age":24,"nation":"Италия","club":"Астон Вилла","value":28.0,"id":"db_0402","ovr":72,"price":391000,"type":"base","stats":{"PAC":73,"SHO":56,"PAS":74,"DRI":69,"DEF":77,"PHY":72},"league":"Английская Премьер-лига"},{"name":"Maxime Estève","pos":"CB","age":24,"nation":"Франция","club":"РБ Лейпциг","value":28.0,"id":"db_0403","ovr":72,"price":391000,"type":"base","stats":{"PAC":68,"SHO":50,"PAS":69,"DRI":65,"DEF":79,"PHY":82},"league":"Немецкая Бундеслига"},{"name":"Anis Hadj Moussa","pos":"RW","age":24,"nation":"Алжир / Франция","club":"Фейеноорд Роттердам","value":28.0,"id":"db_0404","ovr":72,"price":391000,"type":"base","stats":{"PAC":76,"SHO":75,"PAS":75,"DRI":77,"DEF":56,"PHY":68},"league":"Нидерландская Эредивизи"},{"name":"Alan Varela","pos":"CDM","age":25,"nation":"Аргентина","club":"Порту","value":28.0,"id":"db_0405","ovr":72,"price":391000,"type":"base","stats":{"PAC":69,"SHO":61,"PAS":73,"DRI":70,"DEF":77,"PHY":79},"league":"Португальская Примейра"},{"name":"Orkun Kökçü","pos":"CM","age":25,"nation":"Турция / Нидерланды","club":"Бешикташ","value":28.0,"id":"db_0406","ovr":72,"price":391000,"type":"base","stats":{"PAC":71,"SHO":70,"PAS":76,"DRI":74,"DEF":68,"PHY":74},"league":"Другие лиги"},{"name":"Giorgi Mamardashvili","pos":"GK","age":26,"nation":"Грузия","club":"Ливерпуль","value":28.0,"id":"db_0407","ovr":72,"price":391000,"type":"base","stats":{"DIV":74,"HAN":70,"KIC":70,"REF":76,"SPD":66,"POS":74},"league":"Английская Премьер-лига"},{"name":"Chris Richards","pos":"CB","age":26,"nation":"Соединенные Штаты Америки","club":"Кристал Пэлас","value":28.0,"id":"db_0408","ovr":72,"price":391000,"type":"base","stats":{"PAC":69,"SHO":51,"PAS":70,"DRI":61,"DEF":80,"PHY":83},"league":"Английская Премьер-лига"},{"name":"Calvin Bassey","pos":"CB","age":26,"nation":"Нигерия / Англия","club":"Фулхэм","value":28.0,"id":"db_0409","ovr":72,"price":391000,"type":"base","stats":{"PAC":68,"SHO":50,"PAS":69,"DRI":65,"DEF":79,"PHY":82},"league":"Английская Премьер-лига"},{"name":"Djordje Petrović","pos":"GK","age":27,"nation":"Сербия","club":"Борнмут","value":28.0,"id":"db_0410","ovr":72,"price":391000,"type":"base","stats":{"DIV":71,"HAN":72,"KIC":72,"REF":73,"SPD":68,"POS":71},"league":"Английская Премьер-лига"},{"name":"Taty Castellanos","pos":"ST","age":28,"nation":"Аргентина","club":"Вест Хэм Юнайтед","value":28.0,"id":"db_0411","ovr":72,"price":391000,"type":"base","stats":{"PAC":77,"SHO":76,"PAS":70,"DRI":76,"DEF":53,"PHY":77},"league":"Английская Премьер-лига"},{"name":"Nikola Milenković","pos":"CB","age":29,"nation":"Сербия","club":"Ноттингем Форест","value":28.0,"id":"db_0412","ovr":72,"price":391000,"type":"base","stats":{"PAC":69,"SHO":51,"PAS":70,"DRI":61,"DEF":80,"PHY":83},"league":"Английская Премьер-лига"},{"name":"Dean Henderson","pos":"GK","age":29,"nation":"Англия","club":"Кристал Пэлас","value":28.0,"id":"db_0413","ovr":72,"price":391000,"type":"base","stats":{"DIV":73,"HAN":74,"KIC":69,"REF":75,"SPD":65,"POS":73},"league":"Английская Премьер-лига"},{"name":"Jonathan Tah","pos":"CB","age":30,"nation":"Германия / Кот-д'Ивуар","club":"Бавария Мюнхен","value":28.0,"id":"db_0414","ovr":72,"price":391000,"type":"base","stats":{"PAC":69,"SHO":51,"PAS":70,"DRI":61,"DEF":80,"PHY":83},"league":"Немецкая Бундеслига"},{"name":"Marquinhos","pos":"CB","age":32,"nation":"Бразилия / Португалия","club":"Пари Сен-Жермен","value":28.0,"id":"db_0415","ovr":72,"price":391000,"type":"base","stats":{"PAC":68,"SHO":50,"PAS":69,"DRI":65,"DEF":79,"PHY":82},"league":"Французская Лига 1"},{"name":"Nathan De Cat","pos":"CM","age":18,"nation":"Бельгия","club":"Хоффенхайм","value":27.0,"id":"db_0416","ovr":72,"price":391000,"type":"base","stats":{"PAC":73,"SHO":67,"PAS":78,"DRI":71,"DEF":70,"PHY":76},"league":"Немецкая Бундеслига"},{"name":"Joaquin Seys","pos":"LB","age":21,"nation":"Бельгия","club":"Брюгге","value":27.0,"id":"db_0417","ovr":72,"price":391000,"type":"base","stats":{"PAC":73,"SHO":56,"PAS":74,"DRI":69,"DEF":77,"PHY":72},"league":"Другие лиги"},{"name":"Lukas Hornicek","pos":"GK","age":24,"nation":"Чехия","club":"Ньюкасл Юнайтед","value":27.0,"id":"db_0418","ovr":72,"price":391000,"type":"base","stats":{"DIV":73,"HAN":74,"KIC":69,"REF":75,"SPD":65,"POS":73},"league":"Английская Премьер-лига"},{"name":"Miguel Gutiérrez","pos":"LB","age":25,"nation":"Испания","club":"Байер 04 Леверкузен","value":27.0,"id":"db_0419","ovr":72,"price":391000,"type":"base","stats":{"PAC":75,"SHO":58,"PAS":71,"DRI":71,"DEF":74,"PHY":74},"league":"Немецкая Бундеслига"},{"name":"Gabriel Sara","pos":"CM","age":27,"nation":"Бразилия","club":"Галатасарай","value":27.0,"id":"db_0420","ovr":72,"price":391000,"type":"base","stats":{"PAC":70,"SHO":69,"PAS":75,"DRI":73,"DEF":72,"PHY":73},"league":"Другие лиги"},{"name":"Mattéo Guendouzi","pos":"CM","age":27,"nation":"Франция / Марокко","club":"Фенербахче","value":27.0,"id":"db_0421","ovr":72,"price":391000,"type":"base","stats":{"PAC":71,"SHO":70,"PAS":76,"DRI":74,"DEF":68,"PHY":74},"league":"Другие лиги"},{"name":"Lucas Paquetá","pos":"CAM","age":29,"nation":"Бразилия / Португалия","club":"Фламенго","value":27.0,"id":"db_0422","ovr":72,"price":391000,"type":"base","stats":{"PAC":74,"SHO":71,"PAS":78,"DRI":79,"DEF":58,"PHY":68},"league":"Бразильская Серия A"},{"name":"Kees Smit","pos":"CAM","age":20,"nation":"Нидерланды","club":"АЗ Алкмар","value":25.0,"id":"db_0423","ovr":72,"price":391000,"type":"base","stats":{"PAC":72,"SHO":74,"PAS":76,"DRI":77,"DEF":61,"PHY":66},"league":"Нидерландская Эредивизи"},{"name":"Mike Penders","pos":"GK","age":21,"nation":"Бельгия","club":"Челси","value":25.0,"id":"db_0424","ovr":72,"price":391000,"type":"base","stats":{"DIV":75,"HAN":71,"KIC":71,"REF":72,"SPD":67,"POS":75},"league":"Английская Премьер-лига"},{"name":"Matvey Kislyak","pos":"CM","age":21,"nation":"Россия","club":"ЦСКА Москва","value":25.0,"id":"db_0425","ovr":72,"price":391000,"type":"base","stats":{"PAC":70,"SHO":69,"PAS":75,"DRI":73,"DEF":72,"PHY":73},"league":"РПЛ"},{"name":"Chemsdine Talbi","pos":"RW","age":21,"nation":"Марокко / Бельгия","club":"Сандерленд","value":25.0,"id":"db_0426","ovr":72,"price":391000,"type":"base","stats":{"PAC":79,"SHO":73,"PAS":73,"DRI":80,"DEF":54,"PHY":71},"league":"Английская Премьер-лига"},{"name":"Dzenan Pejcinovic","pos":"ST","age":21,"nation":"Германия / Черногория","club":"Штутгарт","value":25.0,"id":"db_0427","ovr":72,"price":391000,"type":"base","stats":{"PAC":77,"SHO":76,"PAS":70,"DRI":76,"DEF":53,"PHY":77},"league":"Немецкая Бундеслига"},{"name":"Rico Lewis","pos":"RB","age":22,"nation":"Англия / Ямайка","club":"Манчестер Сити","value":25.0,"id":"db_0428","ovr":72,"price":391000,"type":"base","stats":{"PAC":75,"SHO":58,"PAS":71,"DRI":71,"DEF":74,"PHY":74},"league":"Английская Премьер-лига"},{"name":"Jamie Gittens","pos":"LW","age":22,"nation":"Англия / Барбадос","club":"Челси","value":25.0,"id":"db_0429","ovr":72,"price":391000,"type":"base","stats":{"PAC":79,"SHO":73,"PAS":74,"DRI":80,"DEF":54,"PHY":71},"league":"Английская Премьер-лига"},{"name":"Gavi","pos":"CM","age":22,"nation":"Испания","club":"Барселона","value":25.0,"id":"db_0430","ovr":72,"price":391000,"type":"base","stats":{"PAC":72,"SHO":66,"PAS":77,"DRI":75,"DEF":69,"PHY":75},"league":"Испанская Ла Лига"},{"name":"Emersonn","pos":"ST","age":22,"nation":"Бразилия","club":"Ипсвич Таун","value":25.0,"id":"db_0431","ovr":72,"price":391000,"type":"base","stats":{"PAC":77,"SHO":76,"PAS":70,"DRI":76,"DEF":53,"PHY":77},"league":"Английская Премьер-лига"},{"name":"Samson Baidoo","pos":"CB","age":22,"nation":"Австрия","club":"Ланс","value":25.0,"id":"db_0432","ovr":72,"price":391000,"type":"base","stats":{"PAC":68,"SHO":50,"PAS":69,"DRI":65,"DEF":79,"PHY":82},"league":"Французская Лига 1"},{"name":"Roméo Lavia","pos":"CDM","age":22,"nation":"Бельгия / Гана","club":"Челси","value":25.0,"id":"db_0433","ovr":72,"price":391000,"type":"base","stats":{"PAC":71,"SHO":58,"PAS":75,"DRI":67,"DEF":79,"PHY":81},"league":"Английская Премьер-лига"},{"name":"Shea Charles","pos":"CDM","age":23,"nation":"Северная Ирландия / Англия","club":"Фулхэм","value":25.0,"id":"db_0434","ovr":72,"price":391000,"type":"base","stats":{"PAC":67,"SHO":59,"PAS":76,"DRI":68,"DEF":80,"PHY":77},"league":"Английская Премьер-лига"},{"name":"Zeno Debast","pos":"CB","age":23,"nation":"Бельгия","club":"Спортинг Лиссабон","value":25.0,"id":"db_0435","ovr":72,"price":391000,"type":"base","stats":{"PAC":65,"SHO":52,"PAS":71,"DRI":62,"DEF":81,"PHY":79},"league":"Португальская Примейра"},{"name":"Arne Engels","pos":"CM","age":23,"nation":"Бельгия","club":"Вест Хэм Юнайтед","value":25.0,"id":"db_0436","ovr":72,"price":391000,"type":"base","stats":{"PAC":72,"SHO":66,"PAS":77,"DRI":75,"DEF":69,"PHY":75},"league":"Английская Премьер-лига"},{"name":"Nathan Ngoy","pos":"CB","age":23,"nation":"Бельгия / ДР Конго","club":"Лилль","value":25.0,"id":"db_0437","ovr":72,"price":391000,"type":"base","stats":{"PAC":66,"SHO":53,"PAS":67,"DRI":63,"DEF":82,"PHY":80},"league":"Французская Лига 1"},{"name":"Albian Hajdari","pos":"CB","age":23,"nation":"Косово / Швейцария","club":"Хоффенхайм","value":25.0,"id":"db_0438","ovr":72,"price":391000,"type":"base","stats":{"PAC":66,"SHO":53,"PAS":67,"DRI":63,"DEF":82,"PHY":80},"league":"Немецкая Бундеслига"},{"name":"Javi Guerra","pos":"CM","age":23,"nation":"Испания","club":"Валенсия","value":25.0,"id":"db_0439","ovr":72,"price":391000,"type":"base","stats":{"PAC":70,"SHO":69,"PAS":75,"DRI":73,"DEF":72,"PHY":73},"league":"Испанская Ла Лига"},{"name":"Matthis Abline","pos":"ST","age":23,"nation":"Франция","club":"Монако","value":25.0,"id":"db_0440","ovr":72,"price":391000,"type":"base","stats":{"PAC":76,"SHO":80,"PAS":69,"DRI":75,"DEF":52,"PHY":76},"league":"Французская Лига 1"},{"name":"Arthur Atta","pos":"CM","age":23,"nation":"Франция / Бенин","club":"Фиорентина","value":25.0,"id":"db_0441","ovr":72,"price":391000,"type":"base","stats":{"PAC":72,"SHO":66,"PAS":77,"DRI":75,"DEF":69,"PHY":75},"league":"Итальянская Серия А"},{"name":"Yeremay Hernández","pos":"LW","age":23,"nation":"Испания","club":"Депортиво Ла-Корунья","value":25.0,"id":"db_0442","ovr":72,"price":391000,"type":"base","stats":{"PAC":79,"SHO":73,"PAS":74,"DRI":80,"DEF":54,"PHY":71},"league":"Испанская Ла Лига"},{"name":"Destiny Udogie","pos":"LB","age":23,"nation":"Италия / Нигерия","club":"Тоттенхэм Хотспур","value":25.0,"id":"db_0443","ovr":72,"price":391000,"type":"base","stats":{"PAC":76,"SHO":54,"PAS":72,"DRI":72,"DEF":75,"PHY":75},"league":"Английская Премьер-лига"},{"name":"Jon Gorrotxategi","pos":"CDM","age":24,"nation":"Испания","club":"Реал Сосьедад","value":25.0,"id":"db_0444","ovr":72,"price":391000,"type":"base","stats":{"PAC":67,"SHO":59,"PAS":76,"DRI":68,"DEF":80,"PHY":77},"league":"Испанская Ла Лига"},{"name":"Georgiy Sudakov","pos":"CAM","age":24,"nation":"Украина","club":"Бенфика","value":25.0,"id":"db_0445","ovr":72,"price":391000,"type":"base","stats":{"PAC":73,"SHO":75,"PAS":77,"DRI":78,"DEF":57,"PHY":67},"league":"Португальская Примейра"},{"name":"Charlie Cresswell","pos":"CB","age":24,"nation":"Англия","club":"Стад Ренн","value":25.0,"id":"db_0446","ovr":72,"price":391000,"type":"base","stats":{"PAC":65,"SHO":52,"PAS":71,"DRI":62,"DEF":81,"PHY":79},"league":"Французская Лига 1"},{"name":"Enzo Millot","pos":"CAM","age":24,"nation":"Франция / Мартиника","club":"Al-Diriyah FC","value":25.0,"id":"db_0447","ovr":72,"price":391000,"type":"base","stats":{"PAC":73,"SHO":75,"PAS":77,"DRI":78,"DEF":57,"PHY":67},"league":"Другие лиги"},{"name":"Koni De Winter","pos":"CB","age":24,"nation":"Бельгия","club":"Милан","value":25.0,"id":"db_0448","ovr":72,"price":391000,"type":"base","stats":{"PAC":67,"SHO":54,"PAS":68,"DRI":64,"DEF":78,"PHY":81},"league":"Итальянская Серия А"},{"name":"Kenneth Taylor","pos":"CM","age":24,"nation":"Нидерланды","club":"Лацио","value":25.0,"id":"db_0449","ovr":72,"price":391000,"type":"base","stats":{"PAC":71,"SHO":70,"PAS":76,"DRI":74,"DEF":68,"PHY":74},"league":"Итальянская Серия А"},{"name":"Chrislain Matsima","pos":"CB","age":24,"nation":"Франция / Конго","club":"Аугсбург","value":25.0,"id":"db_0450","ovr":72,"price":391000,"type":"base","stats":{"PAC":67,"SHO":54,"PAS":68,"DRI":64,"DEF":78,"PHY":81},"league":"Немецкая Бундеслига"},{"name":"Taylor Harwood-Bellis","pos":"CB","age":24,"nation":"Англия","club":"Астон Вилла","value":25.0,"id":"db_0451","ovr":72,"price":391000,"type":"base","stats":{"PAC":69,"SHO":51,"PAS":70,"DRI":61,"DEF":80,"PHY":83},"league":"Английская Премьер-лига"},{"name":"Kaio Jorge","pos":"ST","age":24,"nation":"Бразилия","club":"Крузейро","value":25.0,"id":"db_0452","ovr":72,"price":391000,"type":"base","stats":{"PAC":77,"SHO":76,"PAS":70,"DRI":76,"DEF":53,"PHY":77},"league":"Бразильская Серия A"},{"name":"Carlos Romero","pos":"LB","age":25,"nation":"Испания","club":"Вильярреал","value":25.0,"id":"db_0453","ovr":72,"price":391000,"type":"base","stats":{"PAC":75,"SHO":58,"PAS":71,"DRI":71,"DEF":74,"PHY":74},"league":"Испанская Ла Лига"},{"name":"Sergi Altimira","pos":"CDM","age":25,"nation":"Испания","club":"Спортинг Лиссабон","value":25.0,"id":"db_0454","ovr":72,"price":391000,"type":"base","stats":{"PAC":70,"SHO":57,"PAS":74,"DRI":71,"DEF":78,"PHY":80},"league":"Португальская Примейра"},{"name":"Ramon Hendriks","pos":"CB","age":25,"nation":"Нидерланды","club":"Штутгарт","value":25.0,"id":"db_0455","ovr":72,"price":391000,"type":"base","stats":{"PAC":67,"SHO":54,"PAS":68,"DRI":64,"DEF":78,"PHY":81},"league":"Немецкая Бундеслига"},{"name":"André","pos":"CDM","age":25,"nation":"Бразилия","club":"Вулверхэмптон Уондерерс","value":25.0,"id":"db_0456","ovr":72,"price":391000,"type":"base","stats":{"PAC":70,"SHO":57,"PAS":74,"DRI":71,"DEF":78,"PHY":80},"league":"Английская Премьер-лига"},{"name":"Quinten Timber","pos":"CM","age":25,"nation":"Нидерланды / Кюрасао","club":"Кристал Пэлас","value":25.0,"id":"db_0457","ovr":72,"price":391000,"type":"base","stats":{"PAC":70,"SHO":69,"PAS":75,"DRI":73,"DEF":72,"PHY":73},"league":"Английская Премьер-лига"},{"name":"Brennan Johnson","pos":"RW","age":25,"nation":"Уэльс / Англия","club":"Эвертон","value":25.0,"id":"db_0458","ovr":72,"price":391000,"type":"base","stats":{"PAC":78,"SHO":77,"PAS":72,"DRI":79,"DEF":53,"PHY":70},"league":"Английская Премьер-лига"},{"name":"Nicolas Seiwald","pos":"CDM","age":25,"nation":"Австрия","club":"РБ Лейпциг","value":25.0,"id":"db_0459","ovr":72,"price":391000,"type":"base","stats":{"PAC":71,"SHO":58,"PAS":75,"DRI":67,"DEF":79,"PHY":81},"league":"Немецкая Бундеслига"},{"name":"Igor Jesus","pos":"ST","age":25,"nation":"Бразилия / Объединенные Арабские Эмираты","club":"Ноттингем Форест","value":25.0,"id":"db_0460","ovr":72,"price":391000,"type":"base","stats":{"PAC":74,"SHO":78,"PAS":72,"DRI":73,"DEF":55,"PHY":74},"league":"Английская Премьер-лига"},{"name":"Callum Hudson-Odoi","pos":"LW","age":26,"nation":"Англия / Гана","club":"Ноттингем Форест","value":25.0,"id":"db_0461","ovr":72,"price":391000,"type":"base","stats":{"PAC":80,"SHO":74,"PAS":75,"DRI":76,"DEF":55,"PHY":72},"league":"Английская Премьер-лига"},{"name":"Eduard Spertsyan","pos":"CAM","age":26,"nation":"Армения / Россия","club":"Аль-Ахли","value":25.0,"id":"db_0462","ovr":72,"price":391000,"type":"base","stats":{"PAC":75,"SHO":72,"PAS":79,"DRI":75,"DEF":59,"PHY":69},"league":"Саудовская Про-лига"},{"name":"Richard Ríos","pos":"CDM","age":26,"nation":"Колумбия","club":"Иттихад","value":25.0,"id":"db_0463","ovr":72,"price":391000,"type":"base","stats":{"PAC":68,"SHO":60,"PAS":72,"DRI":69,"DEF":81,"PHY":78},"league":"Саудовская Про-лига"},{"name":"Oihan Sancet","pos":"CAM","age":26,"nation":"Испания","club":"Атлетик Бильбао","value":25.0,"id":"db_0464","ovr":72,"price":391000,"type":"base","stats":{"PAC":74,"SHO":71,"PAS":78,"DRI":79,"DEF":58,"PHY":68},"league":"Испанская Ла Лига"},{"name":"Loïs Openda","pos":"ST","age":26,"nation":"Бельгия / Марокко","club":"Олимпик Лион","value":25.0,"id":"db_0465","ovr":72,"price":391000,"type":"base","stats":{"PAC":74,"SHO":78,"PAS":72,"DRI":73,"DEF":55,"PHY":74},"league":"Французская Лига 1"},{"name":"Leif Davis","pos":"LB","age":26,"nation":"Англия","club":"Ипсвич Таун","value":25.0,"id":"db_0466","ovr":72,"price":391000,"type":"base","stats":{"PAC":77,"SHO":55,"PAS":73,"DRI":68,"DEF":76,"PHY":76},"league":"Английская Премьер-лига"},{"name":"Mats Wieffer","pos":"RB","age":27,"nation":"Нидерланды","club":"Брайтон энд Хоув Альбион","value":25.0,"id":"db_0467","ovr":72,"price":391000,"type":"base","stats":{"PAC":76,"SHO":54,"PAS":72,"DRI":72,"DEF":75,"PHY":75},"league":"Английская Премьер-лига"},{"name":"Dan Ballard","pos":"CB","age":27,"nation":"Северная Ирландия / Англия","club":"Сандерленд","value":25.0,"id":"db_0468","ovr":72,"price":391000,"type":"base","stats":{"PAC":65,"SHO":52,"PAS":71,"DRI":62,"DEF":81,"PHY":79},"league":"Английская Премьер-лига"},{"name":"Tyrick Mitchell","pos":"LB","age":27,"nation":"Англия / Ямайка","club":"Кристал Пэлас","value":25.0,"id":"db_0469","ovr":72,"price":391000,"type":"base","stats":{"PAC":73,"SHO":56,"PAS":74,"DRI":69,"DEF":77,"PHY":72},"league":"Английская Премьер-лига"},{"name":"Matthijs de Ligt","pos":"CB","age":27,"nation":"Нидерланды","club":"Манчестер Юнайтед","value":25.0,"id":"db_0470","ovr":72,"price":391000,"type":"base","stats":{"PAC":65,"SHO":52,"PAS":71,"DRI":62,"DEF":81,"PHY":79},"league":"Английская Премьер-лига"},{"name":"Anastasios Douvikas","pos":"ST","age":27,"nation":"Греция","club":"Комо 1907","value":25.0,"id":"db_0471","ovr":72,"price":391000,"type":"base","stats":{"PAC":76,"SHO":80,"PAS":69,"DRI":75,"DEF":52,"PHY":76},"league":"Итальянская Серия А"},{"name":"Moussa Diaby","pos":"RW","age":27,"nation":"Франция / Мали","club":"Байер 04 Леверкузен","value":25.0,"id":"db_0472","ovr":72,"price":391000,"type":"base","stats":{"PAC":78,"SHO":77,"PAS":72,"DRI":79,"DEF":53,"PHY":70},"league":"Немецкая Бундеслига"},{"name":"Alessandro Buongiorno","pos":"CB","age":27,"nation":"Италия","club":"Наполи","value":25.0,"id":"db_0473","ovr":72,"price":391000,"type":"base","stats":{"PAC":67,"SHO":54,"PAS":68,"DRI":64,"DEF":78,"PHY":81},"league":"Итальянская Серия А"},{"name":"Vitaliy Mykolenko","pos":"LB","age":27,"nation":"Украина","club":"Эвертон","value":25.0,"id":"db_0474","ovr":72,"price":391000,"type":"base","stats":{"PAC":76,"SHO":54,"PAS":72,"DRI":72,"DEF":75,"PHY":75},"league":"Английская Премьер-лига"},{"name":"Justin Kluivert","pos":"CAM","age":27,"nation":"Нидерланды / Суринам","club":"Борнмут","value":25.0,"id":"db_0475","ovr":72,"price":391000,"type":"base","stats":{"PAC":72,"SHO":74,"PAS":76,"DRI":77,"DEF":61,"PHY":66},"league":"Английская Премьер-лига"},{"name":"Gabriel Gudmundsson","pos":"LB","age":27,"nation":"Швеция","club":"Лидс Юнайтед","value":25.0,"id":"db_0476","ovr":72,"price":391000,"type":"base","stats":{"PAC":74,"SHO":57,"PAS":70,"DRI":70,"DEF":78,"PHY":73},"league":"Английская Премьер-лига"},{"name":"Ronald Araújo","pos":"CB","age":27,"nation":"Уругвай / Испания","club":"Ливерпуль","value":25.0,"id":"db_0477","ovr":72,"price":391000,"type":"base","stats":{"PAC":66,"SHO":53,"PAS":67,"DRI":63,"DEF":82,"PHY":80},"league":"Английская Премьер-лига"},{"name":"Mason Mount","pos":"CAM","age":27,"nation":"Англия","club":"Манчестер Юнайтед","value":25.0,"id":"db_0478","ovr":72,"price":391000,"type":"base","stats":{"PAC":75,"SHO":72,"PAS":79,"DRI":75,"DEF":59,"PHY":69},"league":"Английская Премьер-лига"},{"name":"Gianluca Scamacca","pos":"ST","age":27,"nation":"Италия","club":"Аталанта","value":25.0,"id":"db_0479","ovr":72,"price":391000,"type":"base","stats":{"PAC":77,"SHO":76,"PAS":70,"DRI":76,"DEF":53,"PHY":77},"league":"Итальянская Серия А"},{"name":"Joey Veerman","pos":"CM","age":28,"nation":"Нидерланды","club":"Боруссия Дортмунд","value":25.0,"id":"db_0480","ovr":72,"price":391000,"type":"base","stats":{"PAC":73,"SHO":67,"PAS":78,"DRI":71,"DEF":70,"PHY":76},"league":"Немецкая Бундеслига"},{"name":"Exequiel Palacios","pos":"CM","age":28,"nation":"Аргентина","club":"Ипсвич Таун","value":25.0,"id":"db_0481","ovr":72,"price":391000,"type":"base","stats":{"PAC":71,"SHO":70,"PAS":76,"DRI":74,"DEF":68,"PHY":74},"league":"Английская Премьер-лига"},{"name":"Pedro Gonçalves","pos":"LW","age":28,"nation":"Португалия","club":"Фиорентина","value":25.0,"id":"db_0482","ovr":72,"price":391000,"type":"base","stats":{"PAC":77,"SHO":76,"PAS":72,"DRI":78,"DEF":57,"PHY":69},"league":"Итальянская Серия А"},{"name":"David Raum","pos":"LB","age":28,"nation":"Германия","club":"РБ Лейпциг","value":25.0,"id":"db_0483","ovr":72,"price":391000,"type":"base","stats":{"PAC":76,"SHO":54,"PAS":72,"DRI":72,"DEF":75,"PHY":75},"league":"Немецкая Бундеслига"},{"name":"Kristoffer Ajer","pos":"CB","age":28,"nation":"Норвегия","club":"Брентфорд","value":25.0,"id":"db_0484","ovr":72,"price":391000,"type":"base","stats":{"PAC":65,"SHO":52,"PAS":71,"DRI":62,"DEF":81,"PHY":79},"league":"Английская Премьер-лига"},{"name":"Sander Berge","pos":"CDM","age":28,"nation":"Норвегия","club":"Фулхэм","value":25.0,"id":"db_0485","ovr":72,"price":391000,"type":"base","stats":{"PAC":71,"SHO":58,"PAS":75,"DRI":67,"DEF":79,"PHY":81},"league":"Английская Премьер-лига"},{"name":"Manuel Locatelli","pos":"CDM","age":28,"nation":"Италия","club":"Ювентус","value":25.0,"id":"db_0486","ovr":72,"price":391000,"type":"base","stats":{"PAC":71,"SHO":58,"PAS":75,"DRI":67,"DEF":79,"PHY":81},"league":"Итальянская Серия А"},{"name":"Julian Ryerson","pos":"RB","age":29,"nation":"Норвегия / Соединенные Штаты Америки","club":"Боруссия Дортмунд","value":25.0,"id":"db_0487","ovr":72,"price":391000,"type":"base","stats":{"PAC":74,"SHO":57,"PAS":70,"DRI":70,"DEF":78,"PHY":73},"league":"Немецкая Бундеслига"},{"name":"Christopher Nkunku","pos":"ST","age":29,"nation":"Франция / ДР Конго","club":"РБ Лейпциг","value":25.0,"id":"db_0488","ovr":72,"price":391000,"type":"base","stats":{"PAC":75,"SHO":79,"PAS":68,"DRI":74,"DEF":56,"PHY":75},"league":"Немецкая Бундеслига"},{"name":"Dominic Solanke","pos":"ST","age":29,"nation":"Англия / Нигерия","club":"Тоттенхэм Хотспур","value":25.0,"id":"db_0489","ovr":72,"price":391000,"type":"base","stats":{"PAC":76,"SHO":80,"PAS":69,"DRI":75,"DEF":52,"PHY":76},"league":"Английская Премьер-лига"},{"name":"Frenkie de Jong","pos":"CM","age":29,"nation":"Нидерланды","club":"Барселона","value":25.0,"id":"db_0490","ovr":72,"price":391000,"type":"base","stats":{"PAC":72,"SHO":66,"PAS":77,"DRI":75,"DEF":69,"PHY":75},"league":"Испанская Ла Лига"},{"name":"Mikel Oyarzabal","pos":"ST","age":29,"nation":"Испания","club":"Реал Сосьедад","value":25.0,"id":"db_0491","ovr":72,"price":391000,"type":"base","stats":{"PAC":76,"SHO":80,"PAS":69,"DRI":75,"DEF":52,"PHY":76},"league":"Испанская Ла Лига"},{"name":"Dominic Calvert-Lewin","pos":"ST","age":29,"nation":"Англия","club":"Лидс Юнайтед","value":25.0,"id":"db_0492","ovr":72,"price":391000,"type":"base","stats":{"PAC":76,"SHO":80,"PAS":69,"DRI":75,"DEF":52,"PHY":76},"league":"Английская Премьер-лига"},{"name":"Rúben Neves","pos":"CDM","age":29,"nation":"Португалия","club":"Аль-Хилаль Эр-Рияд","value":25.0,"id":"db_0493","ovr":72,"price":391000,"type":"base","stats":{"PAC":67,"SHO":59,"PAS":76,"DRI":68,"DEF":80,"PHY":77},"league":"Саудовская Про-лига"},{"name":"Denis Zakaria","pos":"CDM","age":30,"nation":"Швейцария / ДР Конго","club":"Монако","value":25.0,"id":"db_0494","ovr":72,"price":391000,"type":"base","stats":{"PAC":70,"SHO":57,"PAS":74,"DRI":71,"DEF":78,"PHY":80},"league":"Французская Лига 1"},{"name":"Yoane Wissa","pos":"ST","age":30,"nation":"ДР Конго / Франция","club":"Ньюкасл Юнайтед","value":25.0,"id":"db_0495","ovr":72,"price":391000,"type":"base","stats":{"PAC":78,"SHO":77,"PAS":71,"DRI":72,"DEF":54,"PHY":78},"league":"Английская Премьер-лига"},{"name":"Mikel Merino","pos":"CM","age":30,"nation":"Испания","club":"Арсенал","value":25.0,"id":"db_0496","ovr":72,"price":391000,"type":"base","stats":{"PAC":71,"SHO":70,"PAS":76,"DRI":74,"DEF":68,"PHY":74},"league":"Английская Премьер-лига"},{"name":"Denzel Dumfries","pos":"RB","age":30,"nation":"Нидерланды / Аруба","club":"Реал Мадрид","value":25.0,"id":"db_0497","ovr":72,"price":391000,"type":"base","stats":{"PAC":73,"SHO":56,"PAS":74,"DRI":69,"DEF":77,"PHY":72},"league":"Испанская Ла Лига"},{"name":"Ollie Watkins","pos":"ST","age":30,"nation":"Англия / Ямайка","club":"Аль-Хилаль Эр-Рияд","value":25.0,"id":"db_0498","ovr":72,"price":391000,"type":"base","stats":{"PAC":74,"SHO":78,"PAS":72,"DRI":73,"DEF":55,"PHY":74},"league":"Саудовская Про-лига"},{"id":"legend_messi","name":"Lionel Messi","pos":"RW","age":39,"nation":"Аргентина","club":"Inter Miami","value":20,"ovr":90,"price":1900000,"type":"base","stats":{"PAC":97,"SHO":91,"PAS":91,"DRI":98,"DEF":72,"PHY":89},"league":"Другие лиги"},{"id":"legend_ronaldo","name":"Cristiano Ronaldo","pos":"ST","age":41,"nation":"Португалия","club":"Al-Nassr","value":12,"ovr":88,"price":1450000,"type":"base","stats":{"PAC":91,"SHO":95,"PAS":84,"DRI":90,"DEF":72,"PHY":91},"league":"Саудовская Про-лига"},{"id":"legend_neymar","name":"Neymar Jr.","pos":"LW","age":34,"nation":"Бразилия","club":"Santos","value":15,"ovr":87,"price":1250000,"type":"base","stats":{"PAC":92,"SHO":91,"PAS":87,"DRI":93,"DEF":72,"PHY":84},"league":"Другие лиги"},{"id":"academy_001","name":"Alex Berg","pos":"GK","age":17,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":40,"price":12000,"type":"base","stats":{"DIV":41,"HAN":42,"KIC":37,"REF":43,"SPD":33,"POS":41},"league":"Другие лиги"},{"id":"academy_002","name":"Noah Berg","pos":"CB","age":18,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":41,"price":13000,"type":"base","stats":{"PAC":37,"SHO":30,"PAS":38,"DRI":34,"DEF":48,"PHY":51},"league":"Другие лиги"},{"id":"academy_003","name":"Luca Berg","pos":"LB","age":19,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":42,"price":15000,"type":"base","stats":{"PAC":45,"SHO":30,"PAS":41,"DRI":41,"DEF":44,"PHY":44},"league":"Другие лиги"},{"id":"academy_004","name":"Mateo Berg","pos":"RB","age":20,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":43,"price":17000,"type":"base","stats":{"PAC":47,"SHO":30,"PAS":43,"DRI":43,"DEF":46,"PHY":46},"league":"Другие лиги"},{"id":"academy_005","name":"Elias Berg","pos":"CDM","age":21,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":44,"price":19000,"type":"base","stats":{"PAC":41,"SHO":33,"PAS":45,"DRI":42,"DEF":49,"PHY":51},"league":"Другие лиги"},{"id":"academy_006","name":"Milan Berg","pos":"CM","age":22,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":45,"price":21000,"type":"base","stats":{"PAC":42,"SHO":41,"PAS":52,"DRI":45,"DEF":44,"PHY":45},"league":"Другие лиги"},{"id":"academy_007","name":"Theo Berg","pos":"CAM","age":23,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":46,"price":23000,"type":"base","stats":{"PAC":46,"SHO":48,"PAS":50,"DRI":51,"DEF":35,"PHY":40},"league":"Другие лиги"},{"id":"academy_008","name":"Adam Berg","pos":"LW","age":24,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":47,"price":26000,"type":"base","stats":{"PAC":51,"SHO":50,"PAS":51,"DRI":52,"DEF":31,"PHY":43},"league":"Другие лиги"},{"id":"academy_009","name":"Oscar Berg","pos":"RW","age":25,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":48,"price":29000,"type":"base","stats":{"PAC":52,"SHO":51,"PAS":51,"DRI":53,"DEF":32,"PHY":44},"league":"Другие лиги"},{"id":"academy_010","name":"Leo Berg","pos":"ST","age":26,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":49,"price":32000,"type":"base","stats":{"PAC":52,"SHO":56,"PAS":45,"DRI":51,"DEF":33,"PHY":52},"league":"Другие лиги"},{"id":"academy_011","name":"Daniel Berg","pos":"GK","age":27,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":50,"price":36000,"type":"base","stats":{"DIV":50,"HAN":51,"KIC":46,"REF":52,"SPD":47,"POS":50},"league":"Другие лиги"},{"id":"academy_012","name":"Samuel Berg","pos":"CB","age":28,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":51,"price":40000,"type":"base","stats":{"PAC":48,"SHO":30,"PAS":49,"DRI":40,"DEF":59,"PHY":62},"league":"Другие лиги"},{"id":"academy_013","name":"Rayan Berg","pos":"LB","age":17,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":52,"price":44000,"type":"base","stats":{"PAC":56,"SHO":34,"PAS":52,"DRI":52,"DEF":55,"PHY":55},"league":"Другие лиги"},{"id":"academy_014","name":"Iker Berg","pos":"RB","age":18,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":53,"price":49000,"type":"base","stats":{"PAC":57,"SHO":35,"PAS":53,"DRI":53,"DEF":56,"PHY":56},"league":"Другие лиги"},{"id":"academy_015","name":"Nico Berg","pos":"CDM","age":19,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":54,"price":55000,"type":"base","stats":{"PAC":50,"SHO":42,"PAS":54,"DRI":51,"DEF":63,"PHY":60},"league":"Другие лиги"},{"id":"academy_016","name":"Artem Berg","pos":"CM","age":20,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":55,"price":61000,"type":"base","stats":{"PAC":53,"SHO":52,"PAS":58,"DRI":56,"DEF":55,"PHY":56},"league":"Другие лиги"},{"id":"academy_017","name":"Maksim Berg","pos":"CAM","age":21,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":56,"price":68000,"type":"base","stats":{"PAC":56,"SHO":58,"PAS":60,"DRI":61,"DEF":45,"PHY":50},"league":"Другие лиги"},{"id":"academy_018","name":"Daniil Berg","pos":"LW","age":22,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":57,"price":76000,"type":"base","stats":{"PAC":64,"SHO":58,"PAS":59,"DRI":65,"DEF":39,"PHY":56},"league":"Другие лиги"},{"id":"academy_019","name":"Ivan Berg","pos":"RW","age":23,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":58,"price":85000,"type":"base","stats":{"PAC":66,"SHO":60,"PAS":60,"DRI":62,"DEF":41,"PHY":58},"league":"Другие лиги"},{"id":"academy_020","name":"Mark Berg","pos":"ST","age":24,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":59,"price":95000,"type":"base","stats":{"PAC":64,"SHO":63,"PAS":57,"DRI":63,"DEF":40,"PHY":64},"league":"Другие лиги"},{"id":"academy_021","name":"Alex Silva","pos":"GK","age":25,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":60,"price":106000,"type":"base","stats":{"DIV":62,"HAN":58,"KIC":58,"REF":64,"SPD":54,"POS":62},"league":"Другие лиги"},{"id":"academy_022","name":"Noah Silva","pos":"CB","age":26,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":61,"price":118000,"type":"base","stats":{"PAC":58,"SHO":40,"PAS":59,"DRI":50,"DEF":69,"PHY":72},"league":"Другие лиги"},{"id":"academy_023","name":"Luca Silva","pos":"LB","age":27,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":62,"price":132000,"type":"base","stats":{"PAC":66,"SHO":44,"PAS":62,"DRI":62,"DEF":65,"PHY":65},"league":"Другие лиги"},{"id":"academy_024","name":"Mateo Silva","pos":"RB","age":28,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":63,"price":147000,"type":"base","stats":{"PAC":68,"SHO":46,"PAS":64,"DRI":59,"DEF":67,"PHY":67},"league":"Другие лиги"},{"id":"academy_025","name":"Elias Silva","pos":"CDM","age":17,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":64,"price":164000,"type":"base","stats":{"PAC":62,"SHO":49,"PAS":66,"DRI":63,"DEF":70,"PHY":72},"league":"Другие лиги"},{"id":"academy_026","name":"Milan Silva","pos":"CM","age":18,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":65,"price":182000,"type":"base","stats":{"PAC":63,"SHO":62,"PAS":68,"DRI":66,"DEF":65,"PHY":66},"league":"Другие лиги"},{"id":"academy_027","name":"Theo Silva","pos":"CAM","age":19,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":66,"price":203000,"type":"base","stats":{"PAC":67,"SHO":69,"PAS":71,"DRI":72,"DEF":51,"PHY":61},"league":"Другие лиги"},{"id":"academy_028","name":"Adam Silva","pos":"LW","age":20,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":67,"price":227000,"type":"base","stats":{"PAC":72,"SHO":71,"PAS":67,"DRI":73,"DEF":52,"PHY":64},"league":"Другие лиги"},{"id":"academy_029","name":"Oscar Silva","pos":"RW","age":21,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":68,"price":253000,"type":"base","stats":{"PAC":73,"SHO":72,"PAS":67,"DRI":74,"DEF":53,"PHY":65},"league":"Другие лиги"},{"id":"academy_030","name":"Leo Silva","pos":"ST","age":22,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":69,"price":282000,"type":"base","stats":{"PAC":73,"SHO":77,"PAS":66,"DRI":72,"DEF":49,"PHY":73},"league":"Другие лиги"},{"id":"academy_031","name":"Daniel Silva","pos":"GK","age":23,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":70,"price":314000,"type":"base","stats":{"DIV":71,"HAN":72,"KIC":67,"REF":73,"SPD":63,"POS":71},"league":"Другие лиги"},{"id":"academy_032","name":"Samuel Silva","pos":"CB","age":24,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":40,"price":12000,"type":"base","stats":{"PAC":33,"SHO":30,"PAS":39,"DRI":30,"DEF":49,"PHY":47},"league":"Другие лиги"},{"id":"academy_033","name":"Rayan Silva","pos":"LB","age":25,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":41,"price":13000,"type":"base","stats":{"PAC":44,"SHO":30,"PAS":40,"DRI":40,"DEF":43,"PHY":43},"league":"Другие лиги"},{"id":"academy_034","name":"Iker Silva","pos":"RB","age":26,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":42,"price":15000,"type":"base","stats":{"PAC":45,"SHO":30,"PAS":41,"DRI":41,"DEF":44,"PHY":44},"league":"Другие лиги"},{"id":"academy_035","name":"Nico Silva","pos":"CDM","age":27,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":43,"price":17000,"type":"base","stats":{"PAC":40,"SHO":32,"PAS":44,"DRI":41,"DEF":48,"PHY":50},"league":"Другие лиги"},{"id":"academy_036","name":"Artem Silva","pos":"CM","age":28,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":44,"price":19000,"type":"base","stats":{"PAC":43,"SHO":42,"PAS":48,"DRI":46,"DEF":40,"PHY":46},"league":"Другие лиги"},{"id":"academy_037","name":"Maksim Silva","pos":"CAM","age":17,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":45,"price":21000,"type":"base","stats":{"PAC":46,"SHO":48,"PAS":50,"DRI":51,"DEF":30,"PHY":40},"league":"Другие лиги"},{"id":"academy_038","name":"Daniil Silva","pos":"LW","age":18,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":46,"price":23000,"type":"base","stats":{"PAC":54,"SHO":48,"PAS":49,"DRI":50,"DEF":30,"PHY":46},"league":"Другие лиги"},{"id":"academy_039","name":"Ivan Silva","pos":"RW","age":19,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":47,"price":26000,"type":"base","stats":{"PAC":51,"SHO":50,"PAS":50,"DRI":52,"DEF":31,"PHY":43},"league":"Другие лиги"},{"id":"academy_040","name":"Mark Silva","pos":"ST","age":20,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":48,"price":29000,"type":"base","stats":{"PAC":52,"SHO":56,"PAS":45,"DRI":51,"DEF":30,"PHY":52},"league":"Другие лиги"},{"id":"academy_041","name":"Alex Novak","pos":"GK","age":21,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":49,"price":32000,"type":"base","stats":{"DIV":51,"HAN":47,"KIC":47,"REF":53,"SPD":43,"POS":51},"league":"Другие лиги"},{"id":"academy_042","name":"Noah Novak","pos":"CB","age":22,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":50,"price":36000,"type":"base","stats":{"PAC":47,"SHO":30,"PAS":48,"DRI":39,"DEF":58,"PHY":61},"league":"Другие лиги"},{"id":"academy_043","name":"Luca Novak","pos":"LB","age":23,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":51,"price":40000,"type":"base","stats":{"PAC":55,"SHO":33,"PAS":51,"DRI":51,"DEF":54,"PHY":54},"league":"Другие лиги"},{"id":"academy_044","name":"Mateo Novak","pos":"RB","age":24,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":52,"price":44000,"type":"base","stats":{"PAC":57,"SHO":35,"PAS":53,"DRI":48,"DEF":56,"PHY":56},"league":"Другие лиги"},{"id":"academy_045","name":"Elias Novak","pos":"CDM","age":25,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":53,"price":49000,"type":"base","stats":{"PAC":51,"SHO":38,"PAS":55,"DRI":52,"DEF":59,"PHY":61},"league":"Другие лиги"},{"id":"academy_046","name":"Milan Novak","pos":"CM","age":26,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":54,"price":55000,"type":"base","stats":{"PAC":52,"SHO":51,"PAS":57,"DRI":55,"DEF":54,"PHY":55},"league":"Другие лиги"},{"id":"academy_047","name":"Theo Novak","pos":"CAM","age":27,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":55,"price":61000,"type":"base","stats":{"PAC":56,"SHO":58,"PAS":60,"DRI":61,"DEF":40,"PHY":50},"league":"Другие лиги"},{"id":"academy_048","name":"Adam Novak","pos":"LW","age":28,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":56,"price":68000,"type":"base","stats":{"PAC":61,"SHO":60,"PAS":56,"DRI":62,"DEF":41,"PHY":53},"league":"Другие лиги"},{"id":"academy_049","name":"Oscar Novak","pos":"RW","age":17,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":57,"price":76000,"type":"base","stats":{"PAC":62,"SHO":61,"PAS":56,"DRI":63,"DEF":42,"PHY":54},"league":"Другие лиги"},{"id":"academy_050","name":"Leo Novak","pos":"ST","age":18,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":58,"price":85000,"type":"base","stats":{"PAC":62,"SHO":66,"PAS":55,"DRI":61,"DEF":38,"PHY":62},"league":"Другие лиги"},{"id":"academy_051","name":"Daniel Novak","pos":"GK","age":19,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":59,"price":95000,"type":"base","stats":{"DIV":60,"HAN":61,"KIC":56,"REF":62,"SPD":52,"POS":60},"league":"Другие лиги"},{"id":"academy_052","name":"Samuel Novak","pos":"CB","age":20,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":60,"price":106000,"type":"base","stats":{"PAC":53,"SHO":40,"PAS":59,"DRI":50,"DEF":69,"PHY":67},"league":"Другие лиги"},{"id":"academy_053","name":"Rayan Novak","pos":"LB","age":21,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":61,"price":118000,"type":"base","stats":{"PAC":64,"SHO":47,"PAS":60,"DRI":60,"DEF":63,"PHY":63},"league":"Другие лиги"},{"id":"academy_054","name":"Iker Novak","pos":"RB","age":22,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":62,"price":132000,"type":"base","stats":{"PAC":65,"SHO":48,"PAS":61,"DRI":61,"DEF":64,"PHY":64},"league":"Другие лиги"},{"id":"academy_055","name":"Nico Novak","pos":"CDM","age":23,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":63,"price":147000,"type":"base","stats":{"PAC":60,"SHO":52,"PAS":64,"DRI":61,"DEF":68,"PHY":70},"league":"Другие лиги"},{"id":"academy_056","name":"Artem Novak","pos":"CM","age":24,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":64,"price":164000,"type":"base","stats":{"PAC":63,"SHO":62,"PAS":68,"DRI":66,"DEF":60,"PHY":66},"league":"Другие лиги"},{"id":"academy_057","name":"Maksim Novak","pos":"CAM","age":25,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":65,"price":182000,"type":"base","stats":{"PAC":66,"SHO":68,"PAS":70,"DRI":71,"DEF":50,"PHY":60},"league":"Другие лиги"},{"id":"academy_058","name":"Daniil Novak","pos":"LW","age":26,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":66,"price":203000,"type":"base","stats":{"PAC":74,"SHO":68,"PAS":69,"DRI":70,"DEF":49,"PHY":66},"league":"Другие лиги"},{"id":"academy_059","name":"Ivan Novak","pos":"RW","age":27,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":67,"price":227000,"type":"base","stats":{"PAC":71,"SHO":70,"PAS":70,"DRI":72,"DEF":51,"PHY":63},"league":"Другие лиги"},{"id":"academy_060","name":"Mark Novak","pos":"ST","age":28,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":68,"price":253000,"type":"base","stats":{"PAC":72,"SHO":76,"PAS":65,"DRI":71,"DEF":48,"PHY":72},"league":"Другие лиги"},{"id":"academy_061","name":"Alex Petrov","pos":"GK","age":17,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":69,"price":282000,"type":"base","stats":{"DIV":72,"HAN":68,"KIC":68,"REF":69,"SPD":64,"POS":72},"league":"Другие лиги"},{"id":"academy_062","name":"Noah Petrov","pos":"CB","age":18,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":70,"price":314000,"type":"base","stats":{"PAC":65,"SHO":52,"PAS":66,"DRI":62,"DEF":76,"PHY":79},"league":"Другие лиги"},{"id":"academy_063","name":"Luca Petrov","pos":"LB","age":19,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":40,"price":12000,"type":"base","stats":{"PAC":42,"SHO":30,"PAS":38,"DRI":38,"DEF":46,"PHY":41},"league":"Другие лиги"},{"id":"academy_064","name":"Mateo Petrov","pos":"RB","age":20,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":41,"price":13000,"type":"base","stats":{"PAC":44,"SHO":30,"PAS":40,"DRI":40,"DEF":43,"PHY":43},"league":"Другие лиги"},{"id":"academy_065","name":"Elias Petrov","pos":"CDM","age":21,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":42,"price":15000,"type":"base","stats":{"PAC":38,"SHO":30,"PAS":42,"DRI":39,"DEF":51,"PHY":48},"league":"Другие лиги"},{"id":"academy_066","name":"Milan Petrov","pos":"CM","age":22,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":43,"price":17000,"type":"base","stats":{"PAC":42,"SHO":41,"PAS":47,"DRI":45,"DEF":39,"PHY":45},"league":"Другие лиги"},{"id":"academy_067","name":"Theo Petrov","pos":"CAM","age":23,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":44,"price":19000,"type":"base","stats":{"PAC":46,"SHO":43,"PAS":50,"DRI":51,"DEF":30,"PHY":40},"league":"Другие лиги"},{"id":"academy_068","name":"Adam Petrov","pos":"LW","age":24,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":45,"price":21000,"type":"base","stats":{"PAC":51,"SHO":50,"PAS":46,"DRI":52,"DEF":30,"PHY":43},"league":"Другие лиги"},{"id":"academy_069","name":"Oscar Petrov","pos":"RW","age":25,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":46,"price":23000,"type":"base","stats":{"PAC":52,"SHO":51,"PAS":46,"DRI":53,"DEF":30,"PHY":44},"league":"Другие лиги"},{"id":"academy_070","name":"Leo Petrov","pos":"ST","age":26,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":47,"price":26000,"type":"base","stats":{"PAC":52,"SHO":51,"PAS":45,"DRI":51,"DEF":30,"PHY":52},"league":"Другие лиги"},{"id":"academy_071","name":"Daniel Petrov","pos":"GK","age":27,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":48,"price":29000,"type":"base","stats":{"DIV":50,"HAN":46,"KIC":46,"REF":52,"SPD":42,"POS":50},"league":"Другие лиги"},{"id":"academy_072","name":"Samuel Petrov","pos":"CB","age":28,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":49,"price":32000,"type":"base","stats":{"PAC":45,"SHO":30,"PAS":46,"DRI":42,"DEF":56,"PHY":59},"league":"Другие лиги"},{"id":"academy_073","name":"Rayan Petrov","pos":"LB","age":17,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":50,"price":36000,"type":"base","stats":{"PAC":51,"SHO":34,"PAS":52,"DRI":47,"DEF":55,"PHY":50},"league":"Другие лиги"},{"id":"academy_074","name":"Iker Petrov","pos":"RB","age":18,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":51,"price":40000,"type":"base","stats":{"PAC":52,"SHO":35,"PAS":53,"DRI":48,"DEF":56,"PHY":51},"league":"Другие лиги"},{"id":"academy_075","name":"Nico Petrov","pos":"CDM","age":19,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":52,"price":44000,"type":"base","stats":{"PAC":50,"SHO":37,"PAS":54,"DRI":51,"DEF":58,"PHY":60},"league":"Другие лиги"},{"id":"academy_076","name":"Artem Petrov","pos":"CM","age":20,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":53,"price":49000,"type":"base","stats":{"PAC":53,"SHO":47,"PAS":58,"DRI":56,"DEF":50,"PHY":56},"league":"Другие лиги"},{"id":"academy_077","name":"Maksim Petrov","pos":"CAM","age":21,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":54,"price":55000,"type":"base","stats":{"PAC":56,"SHO":53,"PAS":60,"DRI":61,"DEF":40,"PHY":50},"league":"Другие лиги"},{"id":"academy_078","name":"Daniil Petrov","pos":"LW","age":22,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":55,"price":61000,"type":"base","stats":{"PAC":61,"SHO":60,"PAS":56,"DRI":62,"DEF":36,"PHY":53},"league":"Другие лиги"},{"id":"academy_079","name":"Ivan Petrov","pos":"RW","age":23,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":56,"price":68000,"type":"base","stats":{"PAC":63,"SHO":57,"PAS":57,"DRI":64,"DEF":38,"PHY":55},"league":"Другие лиги"},{"id":"academy_080","name":"Mark Petrov","pos":"ST","age":24,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":57,"price":76000,"type":"base","stats":{"PAC":59,"SHO":63,"PAS":57,"DRI":58,"DEF":40,"PHY":59},"league":"Другие лиги"},{"id":"academy_081","name":"Alex Kovac","pos":"GK","age":25,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":58,"price":85000,"type":"base","stats":{"DIV":61,"HAN":57,"KIC":57,"REF":58,"SPD":53,"POS":61},"league":"Другие лиги"},{"id":"academy_082","name":"Noah Kovac","pos":"CB","age":26,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":59,"price":95000,"type":"base","stats":{"PAC":54,"SHO":41,"PAS":55,"DRI":51,"DEF":65,"PHY":68},"league":"Другие лиги"},{"id":"academy_083","name":"Luca Kovac","pos":"LB","age":27,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":60,"price":106000,"type":"base","stats":{"PAC":62,"SHO":45,"PAS":58,"DRI":58,"DEF":66,"PHY":61},"league":"Другие лиги"},{"id":"academy_084","name":"Mateo Kovac","pos":"RB","age":28,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":61,"price":118000,"type":"base","stats":{"PAC":64,"SHO":47,"PAS":60,"DRI":60,"DEF":63,"PHY":63},"league":"Другие лиги"},{"id":"academy_085","name":"Elias Kovac","pos":"CDM","age":17,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":62,"price":132000,"type":"base","stats":{"PAC":58,"SHO":50,"PAS":62,"DRI":59,"DEF":71,"PHY":68},"league":"Другие лиги"},{"id":"academy_086","name":"Milan Kovac","pos":"CM","age":18,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":63,"price":147000,"type":"base","stats":{"PAC":62,"SHO":61,"PAS":67,"DRI":65,"DEF":59,"PHY":65},"league":"Другие лиги"},{"id":"academy_087","name":"Theo Kovac","pos":"CAM","age":19,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":64,"price":164000,"type":"base","stats":{"PAC":66,"SHO":63,"PAS":70,"DRI":71,"DEF":50,"PHY":60},"league":"Другие лиги"},{"id":"academy_088","name":"Adam Kovac","pos":"LW","age":20,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":65,"price":182000,"type":"base","stats":{"PAC":71,"SHO":70,"PAS":66,"DRI":72,"DEF":46,"PHY":63},"league":"Другие лиги"},{"id":"academy_089","name":"Oscar Kovac","pos":"RW","age":21,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":66,"price":203000,"type":"base","stats":{"PAC":72,"SHO":71,"PAS":66,"DRI":73,"DEF":47,"PHY":64},"league":"Другие лиги"},{"id":"academy_090","name":"Leo Kovac","pos":"ST","age":22,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":67,"price":227000,"type":"base","stats":{"PAC":72,"SHO":71,"PAS":65,"DRI":71,"DEF":48,"PHY":72},"league":"Другие лиги"},{"id":"academy_091","name":"Daniel Kovac","pos":"GK","age":23,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":68,"price":253000,"type":"base","stats":{"DIV":70,"HAN":66,"KIC":66,"REF":72,"SPD":62,"POS":70},"league":"Другие лиги"},{"id":"academy_092","name":"Samuel Kovac","pos":"CB","age":24,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":69,"price":282000,"type":"base","stats":{"PAC":65,"SHO":47,"PAS":66,"DRI":62,"DEF":76,"PHY":79},"league":"Другие лиги"},{"id":"academy_093","name":"Rayan Kovac","pos":"LB","age":25,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":70,"price":314000,"type":"base","stats":{"PAC":71,"SHO":54,"PAS":72,"DRI":67,"DEF":75,"PHY":70},"league":"Другие лиги"},{"id":"academy_094","name":"Iker Kovac","pos":"RB","age":26,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":40,"price":12000,"type":"base","stats":{"PAC":41,"SHO":30,"PAS":42,"DRI":37,"DEF":45,"PHY":40},"league":"Другие лиги"},{"id":"academy_095","name":"Nico Kovac","pos":"CDM","age":27,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":41,"price":13000,"type":"base","stats":{"PAC":39,"SHO":30,"PAS":43,"DRI":40,"DEF":47,"PHY":49},"league":"Другие лиги"},{"id":"academy_096","name":"Artem Kovac","pos":"CM","age":28,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":42,"price":15000,"type":"base","stats":{"PAC":42,"SHO":36,"PAS":47,"DRI":45,"DEF":39,"PHY":45},"league":"Другие лиги"},{"id":"academy_097","name":"Maksim Kovac","pos":"CAM","age":17,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":43,"price":17000,"type":"base","stats":{"PAC":45,"SHO":42,"PAS":49,"DRI":50,"DEF":30,"PHY":39},"league":"Другие лиги"},{"id":"academy_098","name":"Daniil Kovac","pos":"LW","age":18,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":44,"price":19000,"type":"base","stats":{"PAC":50,"SHO":49,"PAS":45,"DRI":51,"DEF":30,"PHY":42},"league":"Другие лиги"},{"id":"academy_099","name":"Ivan Kovac","pos":"RW","age":19,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":45,"price":21000,"type":"base","stats":{"PAC":52,"SHO":46,"PAS":46,"DRI":53,"DEF":30,"PHY":44},"league":"Другие лиги"},{"id":"academy_100","name":"Mark Kovac","pos":"ST","age":20,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":46,"price":23000,"type":"base","stats":{"PAC":48,"SHO":52,"PAS":46,"DRI":47,"DEF":30,"PHY":48},"league":"Другие лиги"},{"id":"academy_101","name":"Alex Moreau","pos":"GK","age":21,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":47,"price":26000,"type":"base","stats":{"DIV":48,"HAN":49,"KIC":44,"REF":50,"SPD":40,"POS":48},"league":"Другие лиги"},{"id":"academy_102","name":"Noah Moreau","pos":"CB","age":22,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":48,"price":29000,"type":"base","stats":{"PAC":41,"SHO":30,"PAS":47,"DRI":38,"DEF":57,"PHY":55},"league":"Другие лиги"},{"id":"academy_103","name":"Luca Moreau","pos":"LB","age":23,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":49,"price":32000,"type":"base","stats":{"PAC":54,"SHO":32,"PAS":50,"DRI":45,"DEF":53,"PHY":53},"league":"Другие лиги"},{"id":"academy_104","name":"Mateo Moreau","pos":"RB","age":24,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":50,"price":36000,"type":"base","stats":{"PAC":51,"SHO":34,"PAS":52,"DRI":47,"DEF":55,"PHY":50},"league":"Другие лиги"},{"id":"academy_105","name":"Elias Moreau","pos":"CDM","age":25,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":51,"price":40000,"type":"base","stats":{"PAC":50,"SHO":37,"PAS":54,"DRI":46,"DEF":58,"PHY":60},"league":"Другие лиги"},{"id":"academy_106","name":"Milan Moreau","pos":"CM","age":26,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":52,"price":44000,"type":"base","stats":{"PAC":51,"SHO":50,"PAS":56,"DRI":54,"DEF":48,"PHY":54},"league":"Другие лиги"},{"id":"academy_107","name":"Theo Moreau","pos":"CAM","age":27,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":53,"price":49000,"type":"base","stats":{"PAC":55,"SHO":52,"PAS":59,"DRI":60,"DEF":39,"PHY":49},"league":"Другие лиги"},{"id":"academy_108","name":"Adam Moreau","pos":"LW","age":28,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":54,"price":55000,"type":"base","stats":{"PAC":60,"SHO":59,"PAS":55,"DRI":61,"DEF":35,"PHY":52},"league":"Другие лиги"},{"id":"academy_109","name":"Oscar Moreau","pos":"RW","age":17,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":55,"price":61000,"type":"base","stats":{"PAC":61,"SHO":60,"PAS":55,"DRI":62,"DEF":36,"PHY":53},"league":"Другие лиги"},{"id":"academy_110","name":"Leo Moreau","pos":"ST","age":18,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":56,"price":68000,"type":"base","stats":{"PAC":61,"SHO":60,"PAS":54,"DRI":60,"DEF":37,"PHY":61},"league":"Другие лиги"},{"id":"academy_111","name":"Daniel Moreau","pos":"GK","age":19,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":57,"price":76000,"type":"base","stats":{"DIV":59,"HAN":55,"KIC":55,"REF":61,"SPD":51,"POS":59},"league":"Другие лиги"},{"id":"academy_112","name":"Samuel Moreau","pos":"CB","age":20,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":58,"price":85000,"type":"base","stats":{"PAC":52,"SHO":39,"PAS":53,"DRI":49,"DEF":68,"PHY":66},"league":"Другие лиги"},{"id":"academy_113","name":"Rayan Moreau","pos":"LB","age":21,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":59,"price":95000,"type":"base","stats":{"PAC":63,"SHO":41,"PAS":59,"DRI":59,"DEF":62,"PHY":62},"league":"Другие лиги"},{"id":"academy_114","name":"Iker Moreau","pos":"RB","age":22,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":60,"price":106000,"type":"base","stats":{"PAC":64,"SHO":42,"PAS":60,"DRI":60,"DEF":63,"PHY":63},"league":"Другие лиги"},{"id":"academy_115","name":"Nico Moreau","pos":"CDM","age":23,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":61,"price":118000,"type":"base","stats":{"PAC":59,"SHO":46,"PAS":63,"DRI":60,"DEF":67,"PHY":69},"league":"Другие лиги"},{"id":"academy_116","name":"Artem Moreau","pos":"CM","age":24,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":62,"price":132000,"type":"base","stats":{"PAC":62,"SHO":56,"PAS":67,"DRI":65,"DEF":59,"PHY":65},"league":"Другие лиги"},{"id":"academy_117","name":"Maksim Moreau","pos":"CAM","age":25,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":63,"price":147000,"type":"base","stats":{"PAC":65,"SHO":62,"PAS":69,"DRI":70,"DEF":49,"PHY":59},"league":"Другие лиги"},{"id":"academy_118","name":"Daniil Moreau","pos":"LW","age":26,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":64,"price":164000,"type":"base","stats":{"PAC":68,"SHO":67,"PAS":68,"DRI":69,"DEF":48,"PHY":60},"league":"Другие лиги"},{"id":"academy_119","name":"Ivan Moreau","pos":"RW","age":27,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":65,"price":182000,"type":"base","stats":{"PAC":70,"SHO":69,"PAS":64,"DRI":71,"DEF":50,"PHY":62},"league":"Другие лиги"},{"id":"academy_120","name":"Mark Moreau","pos":"ST","age":28,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":66,"price":203000,"type":"base","stats":{"PAC":71,"SHO":70,"PAS":64,"DRI":70,"DEF":47,"PHY":71},"league":"Другие лиги"},{"id":"academy_121","name":"Alex Ivanov","pos":"GK","age":17,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":67,"price":227000,"type":"base","stats":{"DIV":66,"HAN":67,"KIC":67,"REF":68,"SPD":63,"POS":66},"league":"Другие лиги"},{"id":"academy_122","name":"Noah Ivanov","pos":"CB","age":18,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":68,"price":253000,"type":"base","stats":{"PAC":64,"SHO":46,"PAS":65,"DRI":61,"DEF":75,"PHY":78},"league":"Другие лиги"},{"id":"academy_123","name":"Luca Ivanov","pos":"LB","age":19,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":69,"price":282000,"type":"base","stats":{"PAC":72,"SHO":55,"PAS":68,"DRI":68,"DEF":71,"PHY":71},"league":"Другие лиги"},{"id":"academy_124","name":"Mateo Ivanov","pos":"RB","age":20,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":70,"price":314000,"type":"base","stats":{"PAC":74,"SHO":52,"PAS":70,"DRI":70,"DEF":73,"PHY":73},"league":"Другие лиги"},{"id":"academy_125","name":"Elias Ivanov","pos":"CDM","age":21,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":40,"price":12000,"type":"base","stats":{"PAC":37,"SHO":30,"PAS":41,"DRI":38,"DEF":45,"PHY":47},"league":"Другие лиги"},{"id":"academy_126","name":"Milan Ivanov","pos":"CM","age":22,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":41,"price":13000,"type":"base","stats":{"PAC":41,"SHO":35,"PAS":46,"DRI":44,"DEF":38,"PHY":44},"league":"Другие лиги"},{"id":"academy_127","name":"Theo Ivanov","pos":"CAM","age":23,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":42,"price":15000,"type":"base","stats":{"PAC":45,"SHO":42,"PAS":49,"DRI":45,"DEF":30,"PHY":39},"league":"Другие лиги"},{"id":"academy_128","name":"Adam Ivanov","pos":"LW","age":24,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":43,"price":17000,"type":"base","stats":{"PAC":50,"SHO":44,"PAS":45,"DRI":51,"DEF":30,"PHY":42},"league":"Другие лиги"},{"id":"academy_129","name":"Oscar Ivanov","pos":"RW","age":25,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":44,"price":19000,"type":"base","stats":{"PAC":51,"SHO":45,"PAS":45,"DRI":52,"DEF":30,"PHY":43},"league":"Другие лиги"},{"id":"academy_130","name":"Leo Ivanov","pos":"ST","age":26,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":45,"price":21000,"type":"base","stats":{"PAC":51,"SHO":50,"PAS":44,"DRI":45,"DEF":30,"PHY":51},"league":"Другие лиги"},{"id":"academy_131","name":"Daniel Ivanov","pos":"GK","age":27,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":46,"price":23000,"type":"base","stats":{"DIV":49,"HAN":45,"KIC":45,"REF":46,"SPD":41,"POS":49},"league":"Другие лиги"},{"id":"academy_132","name":"Samuel Ivanov","pos":"CB","age":28,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":47,"price":26000,"type":"base","stats":{"PAC":42,"SHO":30,"PAS":43,"DRI":39,"DEF":53,"PHY":56},"league":"Другие лиги"},{"id":"academy_133","name":"Rayan Ivanov","pos":"LB","age":17,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":48,"price":29000,"type":"base","stats":{"PAC":50,"SHO":33,"PAS":46,"DRI":46,"DEF":54,"PHY":49},"league":"Другие лиги"},{"id":"academy_134","name":"Iker Ivanov","pos":"RB","age":18,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":49,"price":32000,"type":"base","stats":{"PAC":51,"SHO":34,"PAS":47,"DRI":47,"DEF":55,"PHY":50},"league":"Другие лиги"},{"id":"academy_135","name":"Nico Ivanov","pos":"CDM","age":19,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":50,"price":36000,"type":"base","stats":{"PAC":49,"SHO":36,"PAS":53,"DRI":45,"DEF":57,"PHY":59},"league":"Другие лиги"},{"id":"academy_136","name":"Artem Ivanov","pos":"CM","age":20,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":51,"price":40000,"type":"base","stats":{"PAC":52,"SHO":46,"PAS":57,"DRI":50,"DEF":49,"PHY":55},"league":"Другие лиги"},{"id":"academy_137","name":"Maksim Ivanov","pos":"CAM","age":21,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":52,"price":44000,"type":"base","stats":{"PAC":55,"SHO":52,"PAS":59,"DRI":55,"DEF":39,"PHY":49},"league":"Другие лиги"},{"id":"academy_138","name":"Daniil Ivanov","pos":"LW","age":22,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":53,"price":49000,"type":"base","stats":{"PAC":60,"SHO":54,"PAS":55,"DRI":61,"DEF":35,"PHY":52},"league":"Другие лиги"},{"id":"academy_139","name":"Ivan Ivanov","pos":"RW","age":23,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":54,"price":55000,"type":"base","stats":{"PAC":60,"SHO":59,"PAS":54,"DRI":61,"DEF":35,"PHY":52},"league":"Другие лиги"},{"id":"academy_140","name":"Mark Ivanov","pos":"ST","age":24,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":55,"price":61000,"type":"base","stats":{"PAC":58,"SHO":62,"PAS":51,"DRI":57,"DEF":39,"PHY":58},"league":"Другие лиги"},{"id":"academy_141","name":"Alex Costa","pos":"GK","age":25,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":56,"price":68000,"type":"base","stats":{"DIV":58,"HAN":54,"KIC":54,"REF":60,"SPD":50,"POS":58},"league":"Другие лиги"},{"id":"academy_142","name":"Noah Costa","pos":"CB","age":26,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":57,"price":76000,"type":"base","stats":{"PAC":51,"SHO":38,"PAS":52,"DRI":48,"DEF":67,"PHY":65},"league":"Другие лиги"},{"id":"academy_143","name":"Luca Costa","pos":"LB","age":27,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":58,"price":85000,"type":"base","stats":{"PAC":59,"SHO":42,"PAS":60,"DRI":55,"DEF":63,"PHY":58},"league":"Другие лиги"},{"id":"academy_144","name":"Mateo Costa","pos":"RB","age":28,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":59,"price":95000,"type":"base","stats":{"PAC":61,"SHO":44,"PAS":57,"DRI":57,"DEF":65,"PHY":60},"league":"Другие лиги"},{"id":"academy_145","name":"Elias Costa","pos":"CDM","age":17,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":60,"price":106000,"type":"base","stats":{"PAC":55,"SHO":47,"PAS":64,"DRI":56,"DEF":68,"PHY":65},"league":"Другие лиги"},{"id":"academy_146","name":"Milan Costa","pos":"CM","age":18,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":61,"price":118000,"type":"base","stats":{"PAC":61,"SHO":55,"PAS":66,"DRI":64,"DEF":58,"PHY":64},"league":"Другие лиги"},{"id":"academy_147","name":"Theo Costa","pos":"CAM","age":19,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":62,"price":132000,"type":"base","stats":{"PAC":63,"SHO":65,"PAS":67,"DRI":68,"DEF":47,"PHY":57},"league":"Другие лиги"},{"id":"academy_148","name":"Adam Costa","pos":"LW","age":20,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":63,"price":147000,"type":"base","stats":{"PAC":70,"SHO":64,"PAS":65,"DRI":71,"DEF":45,"PHY":62},"league":"Другие лиги"},{"id":"academy_149","name":"Oscar Costa","pos":"RW","age":21,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":64,"price":164000,"type":"base","stats":{"PAC":71,"SHO":65,"PAS":65,"DRI":72,"DEF":46,"PHY":63},"league":"Другие лиги"},{"id":"academy_150","name":"Leo Costa","pos":"ST","age":22,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":65,"price":182000,"type":"base","stats":{"PAC":69,"SHO":73,"PAS":62,"DRI":68,"DEF":45,"PHY":69},"league":"Другие лиги"},{"id":"academy_151","name":"Daniel Costa","pos":"GK","age":23,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":66,"price":203000,"type":"base","stats":{"DIV":67,"HAN":68,"KIC":63,"REF":69,"SPD":59,"POS":67},"league":"Другие лиги"},{"id":"academy_152","name":"Samuel Costa","pos":"CB","age":24,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":67,"price":227000,"type":"base","stats":{"PAC":62,"SHO":49,"PAS":63,"DRI":59,"DEF":73,"PHY":76},"league":"Другие лиги"},{"id":"academy_153","name":"Rayan Costa","pos":"LB","age":25,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":68,"price":253000,"type":"base","stats":{"PAC":73,"SHO":51,"PAS":69,"DRI":64,"DEF":72,"PHY":72},"league":"Другие лиги"},{"id":"academy_154","name":"Iker Costa","pos":"RB","age":26,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":69,"price":282000,"type":"base","stats":{"PAC":74,"SHO":52,"PAS":70,"DRI":65,"DEF":73,"PHY":73},"league":"Другие лиги"},{"id":"academy_155","name":"Nico Costa","pos":"CDM","age":27,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":70,"price":314000,"type":"base","stats":{"PAC":67,"SHO":59,"PAS":71,"DRI":68,"DEF":75,"PHY":77},"league":"Другие лиги"},{"id":"academy_156","name":"Artem Costa","pos":"CM","age":28,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":40,"price":12000,"type":"base","stats":{"PAC":39,"SHO":38,"PAS":44,"DRI":42,"DEF":36,"PHY":42},"league":"Другие лиги"},{"id":"academy_157","name":"Maksim Costa","pos":"CAM","age":17,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":41,"price":13000,"type":"base","stats":{"PAC":42,"SHO":44,"PAS":46,"DRI":47,"DEF":30,"PHY":36},"league":"Другие лиги"},{"id":"academy_158","name":"Daniil Costa","pos":"LW","age":18,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":42,"price":15000,"type":"base","stats":{"PAC":47,"SHO":46,"PAS":42,"DRI":48,"DEF":30,"PHY":39},"league":"Другие лиги"},{"id":"academy_159","name":"Ivan Costa","pos":"RW","age":19,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":43,"price":17000,"type":"base","stats":{"PAC":49,"SHO":48,"PAS":43,"DRI":50,"DEF":30,"PHY":41},"league":"Другие лиги"},{"id":"academy_160","name":"Mark Costa","pos":"ST","age":20,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":44,"price":19000,"type":"base","stats":{"PAC":50,"SHO":49,"PAS":43,"DRI":44,"DEF":30,"PHY":50},"league":"Другие лиги"},{"id":"academy_161","name":"Alex Meyer","pos":"GK","age":21,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":45,"price":21000,"type":"base","stats":{"DIV":48,"HAN":44,"KIC":44,"REF":45,"SPD":40,"POS":48},"league":"Другие лиги"},{"id":"academy_162","name":"Noah Meyer","pos":"CB","age":22,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":46,"price":23000,"type":"base","stats":{"PAC":41,"SHO":30,"PAS":42,"DRI":38,"DEF":52,"PHY":55},"league":"Другие лиги"},{"id":"academy_163","name":"Luca Meyer","pos":"LB","age":23,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":47,"price":26000,"type":"base","stats":{"PAC":49,"SHO":32,"PAS":45,"DRI":45,"DEF":53,"PHY":48},"league":"Другие лиги"},{"id":"academy_164","name":"Mateo Meyer","pos":"RB","age":24,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":48,"price":29000,"type":"base","stats":{"PAC":51,"SHO":34,"PAS":47,"DRI":47,"DEF":50,"PHY":50},"league":"Другие лиги"},{"id":"academy_165","name":"Elias Meyer","pos":"CDM","age":25,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":49,"price":32000,"type":"base","stats":{"PAC":45,"SHO":37,"PAS":49,"DRI":46,"DEF":58,"PHY":55},"league":"Другие лиги"},{"id":"academy_166","name":"Milan Meyer","pos":"CM","age":26,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":50,"price":36000,"type":"base","stats":{"PAC":49,"SHO":48,"PAS":54,"DRI":52,"DEF":46,"PHY":52},"league":"Другие лиги"},{"id":"academy_167","name":"Theo Meyer","pos":"CAM","age":27,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":51,"price":40000,"type":"base","stats":{"PAC":53,"SHO":50,"PAS":57,"DRI":58,"DEF":37,"PHY":47},"league":"Другие лиги"},{"id":"academy_168","name":"Adam Meyer","pos":"LW","age":28,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":52,"price":44000,"type":"base","stats":{"PAC":58,"SHO":57,"PAS":53,"DRI":59,"DEF":33,"PHY":50},"league":"Другие лиги"},{"id":"academy_169","name":"Oscar Meyer","pos":"RW","age":17,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":53,"price":49000,"type":"base","stats":{"PAC":59,"SHO":58,"PAS":53,"DRI":60,"DEF":34,"PHY":51},"league":"Другие лиги"},{"id":"academy_170","name":"Leo Meyer","pos":"ST","age":18,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":54,"price":55000,"type":"base","stats":{"PAC":59,"SHO":58,"PAS":52,"DRI":58,"DEF":35,"PHY":59},"league":"Другие лиги"},{"id":"academy_171","name":"Daniel Meyer","pos":"GK","age":19,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":55,"price":61000,"type":"base","stats":{"DIV":57,"HAN":53,"KIC":53,"REF":59,"SPD":49,"POS":57},"league":"Другие лиги"},{"id":"academy_172","name":"Samuel Meyer","pos":"CB","age":20,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":56,"price":68000,"type":"base","stats":{"PAC":52,"SHO":34,"PAS":53,"DRI":49,"DEF":63,"PHY":66},"league":"Другие лиги"},{"id":"academy_173","name":"Rayan Meyer","pos":"LB","age":21,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":57,"price":76000,"type":"base","stats":{"PAC":58,"SHO":41,"PAS":59,"DRI":54,"DEF":62,"PHY":57},"league":"Другие лиги"},{"id":"academy_174","name":"Iker Meyer","pos":"RB","age":22,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":58,"price":85000,"type":"base","stats":{"PAC":59,"SHO":42,"PAS":60,"DRI":55,"DEF":63,"PHY":58},"league":"Другие лиги"},{"id":"academy_175","name":"Nico Meyer","pos":"CDM","age":23,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":59,"price":95000,"type":"base","stats":{"PAC":57,"SHO":44,"PAS":61,"DRI":58,"DEF":65,"PHY":67},"league":"Другие лиги"},{"id":"academy_176","name":"Artem Meyer","pos":"CM","age":24,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":60,"price":106000,"type":"base","stats":{"PAC":60,"SHO":54,"PAS":65,"DRI":63,"DEF":57,"PHY":63},"league":"Другие лиги"},{"id":"academy_177","name":"Maksim Meyer","pos":"CAM","age":25,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":61,"price":118000,"type":"base","stats":{"PAC":63,"SHO":60,"PAS":67,"DRI":68,"DEF":47,"PHY":57},"league":"Другие лиги"},{"id":"academy_178","name":"Daniil Meyer","pos":"LW","age":26,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":62,"price":132000,"type":"base","stats":{"PAC":68,"SHO":67,"PAS":63,"DRI":69,"DEF":43,"PHY":60},"league":"Другие лиги"},{"id":"academy_179","name":"Ivan Meyer","pos":"RW","age":27,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":63,"price":147000,"type":"base","stats":{"PAC":70,"SHO":64,"PAS":64,"DRI":71,"DEF":45,"PHY":62},"league":"Другие лиги"},{"id":"academy_180","name":"Mark Meyer","pos":"ST","age":28,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":64,"price":164000,"type":"base","stats":{"PAC":66,"SHO":70,"PAS":64,"DRI":65,"DEF":47,"PHY":66},"league":"Другие лиги"},{"id":"academy_181","name":"Alex Santos","pos":"GK","age":17,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":65,"price":182000,"type":"base","stats":{"DIV":67,"HAN":63,"KIC":63,"REF":69,"SPD":59,"POS":67},"league":"Другие лиги"},{"id":"academy_182","name":"Noah Santos","pos":"CB","age":18,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":66,"price":203000,"type":"base","stats":{"PAC":60,"SHO":47,"PAS":61,"DRI":57,"DEF":76,"PHY":74},"league":"Другие лиги"},{"id":"academy_183","name":"Luca Santos","pos":"LB","age":19,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":67,"price":227000,"type":"base","stats":{"PAC":68,"SHO":51,"PAS":69,"DRI":64,"DEF":72,"PHY":67},"league":"Другие лиги"},{"id":"academy_184","name":"Mateo Santos","pos":"RB","age":20,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":68,"price":253000,"type":"base","stats":{"PAC":70,"SHO":53,"PAS":66,"DRI":66,"DEF":74,"PHY":69},"league":"Другие лиги"},{"id":"academy_185","name":"Elias Santos","pos":"CDM","age":21,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":69,"price":282000,"type":"base","stats":{"PAC":64,"SHO":56,"PAS":73,"DRI":65,"DEF":77,"PHY":74},"league":"Другие лиги"},{"id":"academy_186","name":"Milan Santos","pos":"CM","age":22,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":70,"price":314000,"type":"base","stats":{"PAC":70,"SHO":64,"PAS":75,"DRI":73,"DEF":67,"PHY":73},"league":"Другие лиги"},{"id":"academy_187","name":"Theo Santos","pos":"CAM","age":23,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":40,"price":12000,"type":"base","stats":{"PAC":41,"SHO":43,"PAS":45,"DRI":46,"DEF":30,"PHY":35},"league":"Другие лиги"},{"id":"academy_188","name":"Adam Santos","pos":"LW","age":24,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":41,"price":13000,"type":"base","stats":{"PAC":48,"SHO":42,"PAS":43,"DRI":49,"DEF":30,"PHY":40},"league":"Другие лиги"},{"id":"academy_189","name":"Oscar Santos","pos":"RW","age":25,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":42,"price":15000,"type":"base","stats":{"PAC":49,"SHO":43,"PAS":43,"DRI":50,"DEF":30,"PHY":41},"league":"Другие лиги"},{"id":"academy_190","name":"Leo Santos","pos":"ST","age":26,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":43,"price":17000,"type":"base","stats":{"PAC":47,"SHO":51,"PAS":40,"DRI":46,"DEF":30,"PHY":47},"league":"Другие лиги"},{"id":"academy_191","name":"Daniel Santos","pos":"GK","age":27,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":44,"price":19000,"type":"base","stats":{"DIV":45,"HAN":46,"KIC":41,"REF":47,"SPD":37,"POS":45},"league":"Другие лиги"},{"id":"academy_192","name":"Samuel Santos","pos":"CB","age":28,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":45,"price":21000,"type":"base","stats":{"PAC":40,"SHO":30,"PAS":41,"DRI":37,"DEF":51,"PHY":54},"league":"Другие лиги"},{"id":"academy_193","name":"Rayan Santos","pos":"LB","age":17,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":46,"price":23000,"type":"base","stats":{"PAC":51,"SHO":30,"PAS":47,"DRI":42,"DEF":50,"PHY":50},"league":"Другие лиги"},{"id":"academy_194","name":"Iker Santos","pos":"RB","age":18,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":47,"price":26000,"type":"base","stats":{"PAC":52,"SHO":30,"PAS":48,"DRI":43,"DEF":51,"PHY":51},"league":"Другие лиги"},{"id":"academy_195","name":"Nico Santos","pos":"CDM","age":19,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":48,"price":29000,"type":"base","stats":{"PAC":45,"SHO":37,"PAS":49,"DRI":46,"DEF":53,"PHY":55},"league":"Другие лиги"},{"id":"academy_196","name":"Artem Santos","pos":"CM","age":20,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":49,"price":32000,"type":"base","stats":{"PAC":48,"SHO":47,"PAS":53,"DRI":51,"DEF":45,"PHY":51},"league":"Другие лиги"},{"id":"academy_197","name":"Maksim Santos","pos":"CAM","age":21,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":50,"price":36000,"type":"base","stats":{"PAC":51,"SHO":53,"PAS":55,"DRI":56,"DEF":35,"PHY":45},"league":"Другие лиги"},{"id":"academy_198","name":"Daniil Santos","pos":"LW","age":22,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":51,"price":40000,"type":"base","stats":{"PAC":56,"SHO":55,"PAS":51,"DRI":57,"DEF":36,"PHY":48},"league":"Другие лиги"},{"id":"academy_199","name":"Ivan Santos","pos":"RW","age":23,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":52,"price":44000,"type":"base","stats":{"PAC":58,"SHO":57,"PAS":52,"DRI":59,"DEF":33,"PHY":50},"league":"Другие лиги"},{"id":"academy_200","name":"Mark Santos","pos":"ST","age":24,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":53,"price":49000,"type":"base","stats":{"PAC":59,"SHO":58,"PAS":52,"DRI":53,"DEF":35,"PHY":59},"league":"Другие лиги"},{"id":"academy_201","name":"Alex Keller","pos":"GK","age":25,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":54,"price":55000,"type":"base","stats":{"DIV":54,"HAN":55,"KIC":50,"REF":56,"SPD":51,"POS":54},"league":"Другие лиги"},{"id":"academy_202","name":"Noah Keller","pos":"CB","age":26,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":55,"price":61000,"type":"base","stats":{"PAC":50,"SHO":37,"PAS":51,"DRI":47,"DEF":61,"PHY":64},"league":"Другие лиги"},{"id":"academy_203","name":"Luca Keller","pos":"LB","age":27,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":56,"price":68000,"type":"base","stats":{"PAC":60,"SHO":38,"PAS":56,"DRI":56,"DEF":59,"PHY":59},"league":"Другие лиги"},{"id":"academy_204","name":"Mateo Keller","pos":"RB","age":28,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":57,"price":76000,"type":"base","stats":{"PAC":60,"SHO":43,"PAS":56,"DRI":56,"DEF":59,"PHY":59},"league":"Другие лиги"},{"id":"academy_205","name":"Elias Keller","pos":"CDM","age":17,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":58,"price":85000,"type":"base","stats":{"PAC":56,"SHO":43,"PAS":60,"DRI":57,"DEF":64,"PHY":66},"league":"Другие лиги"},{"id":"academy_206","name":"Milan Keller","pos":"CM","age":18,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":59,"price":95000,"type":"base","stats":{"PAC":60,"SHO":54,"PAS":65,"DRI":58,"DEF":57,"PHY":63},"league":"Другие лиги"},{"id":"academy_207","name":"Theo Keller","pos":"CAM","age":19,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":60,"price":106000,"type":"base","stats":{"PAC":59,"SHO":61,"PAS":68,"DRI":64,"DEF":48,"PHY":53},"league":"Другие лиги"},{"id":"academy_208","name":"Adam Keller","pos":"LW","age":20,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":61,"price":118000,"type":"base","stats":{"PAC":69,"SHO":63,"PAS":64,"DRI":65,"DEF":44,"PHY":61},"league":"Другие лиги"},{"id":"academy_209","name":"Oscar Keller","pos":"RW","age":21,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":62,"price":132000,"type":"base","stats":{"PAC":70,"SHO":64,"PAS":64,"DRI":66,"DEF":45,"PHY":62},"league":"Другие лиги"},{"id":"academy_210","name":"Leo Keller","pos":"ST","age":22,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":63,"price":147000,"type":"base","stats":{"PAC":65,"SHO":69,"PAS":63,"DRI":64,"DEF":46,"PHY":65},"league":"Другие лиги"},{"id":"academy_211","name":"Daniel Keller","pos":"GK","age":23,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":64,"price":164000,"type":"base","stats":{"DIV":63,"HAN":64,"KIC":64,"REF":65,"SPD":60,"POS":63},"league":"Другие лиги"},{"id":"academy_212","name":"Samuel Keller","pos":"CB","age":24,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":65,"price":182000,"type":"base","stats":{"PAC":61,"SHO":43,"PAS":62,"DRI":58,"DEF":72,"PHY":75},"league":"Другие лиги"},{"id":"academy_213","name":"Rayan Keller","pos":"LB","age":25,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":66,"price":203000,"type":"base","stats":{"PAC":69,"SHO":52,"PAS":65,"DRI":65,"DEF":68,"PHY":68},"league":"Другие лиги"},{"id":"academy_214","name":"Iker Keller","pos":"RB","age":26,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":67,"price":227000,"type":"base","stats":{"PAC":70,"SHO":53,"PAS":66,"DRI":66,"DEF":69,"PHY":69},"league":"Другие лиги"},{"id":"academy_215","name":"Nico Keller","pos":"CDM","age":27,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":68,"price":253000,"type":"base","stats":{"PAC":63,"SHO":55,"PAS":72,"DRI":64,"DEF":76,"PHY":73},"league":"Другие лиги"},{"id":"academy_216","name":"Artem Keller","pos":"CM","age":28,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":69,"price":282000,"type":"base","stats":{"PAC":66,"SHO":65,"PAS":76,"DRI":69,"DEF":68,"PHY":69},"league":"Другие лиги"},{"id":"academy_217","name":"Maksim Keller","pos":"CAM","age":17,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":70,"price":314000,"type":"base","stats":{"PAC":69,"SHO":71,"PAS":78,"DRI":74,"DEF":58,"PHY":63},"league":"Другие лиги"},{"id":"academy_218","name":"Daniil Keller","pos":"LW","age":18,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":40,"price":12000,"type":"base","stats":{"PAC":46,"SHO":45,"PAS":41,"DRI":47,"DEF":30,"PHY":38},"league":"Другие лиги"},{"id":"academy_219","name":"Ivan Keller","pos":"RW","age":19,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":41,"price":13000,"type":"base","stats":{"PAC":48,"SHO":42,"PAS":42,"DRI":49,"DEF":30,"PHY":40},"league":"Другие лиги"},{"id":"academy_220","name":"Mark Keller","pos":"ST","age":20,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":42,"price":15000,"type":"base","stats":{"PAC":46,"SHO":50,"PAS":39,"DRI":45,"DEF":30,"PHY":46},"league":"Другие лиги"},{"id":"academy_221","name":"Alex Popov","pos":"GK","age":21,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":43,"price":17000,"type":"base","stats":{"DIV":45,"HAN":41,"KIC":41,"REF":47,"SPD":37,"POS":45},"league":"Другие лиги"},{"id":"academy_222","name":"Noah Popov","pos":"CB","age":22,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":44,"price":19000,"type":"base","stats":{"PAC":41,"SHO":30,"PAS":42,"DRI":33,"DEF":52,"PHY":55},"league":"Другие лиги"},{"id":"academy_223","name":"Luca Popov","pos":"LB","age":23,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":45,"price":21000,"type":"base","stats":{"PAC":49,"SHO":30,"PAS":45,"DRI":45,"DEF":48,"PHY":48},"league":"Другие лиги"},{"id":"academy_224","name":"Mateo Popov","pos":"RB","age":24,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":46,"price":23000,"type":"base","stats":{"PAC":51,"SHO":30,"PAS":47,"DRI":42,"DEF":50,"PHY":50},"league":"Другие лиги"},{"id":"academy_225","name":"Elias Popov","pos":"CDM","age":25,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":47,"price":26000,"type":"base","stats":{"PAC":45,"SHO":32,"PAS":49,"DRI":46,"DEF":53,"PHY":55},"league":"Другие лиги"},{"id":"academy_226","name":"Milan Popov","pos":"CM","age":26,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":48,"price":29000,"type":"base","stats":{"PAC":46,"SHO":45,"PAS":51,"DRI":49,"DEF":48,"PHY":49},"league":"Другие лиги"},{"id":"academy_227","name":"Theo Popov","pos":"CAM","age":27,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":49,"price":32000,"type":"base","stats":{"PAC":50,"SHO":52,"PAS":54,"DRI":55,"DEF":34,"PHY":44},"league":"Другие лиги"},{"id":"academy_228","name":"Adam Popov","pos":"LW","age":28,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":50,"price":36000,"type":"base","stats":{"PAC":55,"SHO":54,"PAS":50,"DRI":56,"DEF":35,"PHY":47},"league":"Другие лиги"},{"id":"academy_229","name":"Oscar Popov","pos":"RW","age":17,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":51,"price":40000,"type":"base","stats":{"PAC":56,"SHO":55,"PAS":50,"DRI":57,"DEF":36,"PHY":48},"league":"Другие лиги"},{"id":"academy_230","name":"Leo Popov","pos":"ST","age":18,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":52,"price":44000,"type":"base","stats":{"PAC":56,"SHO":60,"PAS":49,"DRI":55,"DEF":32,"PHY":56},"league":"Другие лиги"},{"id":"academy_231","name":"Daniel Popov","pos":"GK","age":19,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":53,"price":49000,"type":"base","stats":{"DIV":54,"HAN":55,"KIC":50,"REF":56,"SPD":46,"POS":54},"league":"Другие лиги"},{"id":"academy_232","name":"Samuel Popov","pos":"CB","age":20,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":54,"price":55000,"type":"base","stats":{"PAC":47,"SHO":34,"PAS":53,"DRI":44,"DEF":63,"PHY":61},"league":"Другие лиги"},{"id":"academy_233","name":"Rayan Popov","pos":"LB","age":21,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":55,"price":61000,"type":"base","stats":{"PAC":58,"SHO":41,"PAS":54,"DRI":54,"DEF":57,"PHY":57},"league":"Другие лиги"},{"id":"academy_234","name":"Iker Popov","pos":"RB","age":22,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":56,"price":68000,"type":"base","stats":{"PAC":59,"SHO":42,"PAS":55,"DRI":55,"DEF":58,"PHY":58},"league":"Другие лиги"},{"id":"academy_235","name":"Nico Popov","pos":"CDM","age":23,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":57,"price":76000,"type":"base","stats":{"PAC":54,"SHO":46,"PAS":58,"DRI":55,"DEF":62,"PHY":64},"league":"Другие лиги"},{"id":"academy_236","name":"Artem Popov","pos":"CM","age":24,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":58,"price":85000,"type":"base","stats":{"PAC":57,"SHO":56,"PAS":62,"DRI":60,"DEF":54,"PHY":60},"league":"Другие лиги"},{"id":"academy_237","name":"Maksim Popov","pos":"CAM","age":25,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":59,"price":95000,"type":"base","stats":{"PAC":60,"SHO":62,"PAS":64,"DRI":65,"DEF":44,"PHY":54},"league":"Другие лиги"},{"id":"academy_238","name":"Daniil Popov","pos":"LW","age":26,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":60,"price":106000,"type":"base","stats":{"PAC":68,"SHO":62,"PAS":63,"DRI":64,"DEF":43,"PHY":60},"league":"Другие лиги"},{"id":"academy_239","name":"Ivan Popov","pos":"RW","age":27,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":61,"price":118000,"type":"base","stats":{"PAC":65,"SHO":64,"PAS":64,"DRI":66,"DEF":45,"PHY":57},"league":"Другие лиги"},{"id":"academy_240","name":"Mark Popov","pos":"ST","age":28,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":62,"price":132000,"type":"base","stats":{"PAC":66,"SHO":70,"PAS":59,"DRI":65,"DEF":42,"PHY":66},"league":"Другие лиги"},{"id":"academy_241","name":"Alex Varga","pos":"GK","age":17,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":63,"price":147000,"type":"base","stats":{"DIV":65,"HAN":61,"KIC":61,"REF":67,"SPD":57,"POS":65},"league":"Другие лиги"},{"id":"academy_242","name":"Noah Varga","pos":"CB","age":18,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":64,"price":164000,"type":"base","stats":{"PAC":61,"SHO":43,"PAS":62,"DRI":53,"DEF":72,"PHY":75},"league":"Другие лиги"},{"id":"academy_243","name":"Luca Varga","pos":"LB","age":19,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":65,"price":182000,"type":"base","stats":{"PAC":69,"SHO":47,"PAS":65,"DRI":65,"DEF":68,"PHY":68},"league":"Другие лиги"},{"id":"academy_244","name":"Mateo Varga","pos":"RB","age":20,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":66,"price":203000,"type":"base","stats":{"PAC":71,"SHO":49,"PAS":67,"DRI":62,"DEF":70,"PHY":70},"league":"Другие лиги"},{"id":"academy_245","name":"Elias Varga","pos":"CDM","age":21,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":67,"price":227000,"type":"base","stats":{"PAC":65,"SHO":52,"PAS":69,"DRI":66,"DEF":73,"PHY":75},"league":"Другие лиги"},{"id":"academy_246","name":"Milan Varga","pos":"CM","age":22,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":68,"price":253000,"type":"base","stats":{"PAC":66,"SHO":65,"PAS":71,"DRI":69,"DEF":68,"PHY":69},"league":"Другие лиги"},{"id":"academy_247","name":"Theo Varga","pos":"CAM","age":23,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":69,"price":282000,"type":"base","stats":{"PAC":70,"SHO":72,"PAS":74,"DRI":75,"DEF":54,"PHY":64},"league":"Другие лиги"},{"id":"academy_248","name":"Adam Varga","pos":"LW","age":24,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":70,"price":314000,"type":"base","stats":{"PAC":75,"SHO":74,"PAS":70,"DRI":76,"DEF":55,"PHY":67},"league":"Другие лиги"},{"id":"academy_249","name":"Oscar Varga","pos":"RW","age":25,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":40,"price":12000,"type":"base","stats":{"PAC":45,"SHO":44,"PAS":39,"DRI":46,"DEF":30,"PHY":37},"league":"Другие лиги"},{"id":"academy_250","name":"Leo Varga","pos":"ST","age":26,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":41,"price":13000,"type":"base","stats":{"PAC":45,"SHO":49,"PAS":38,"DRI":44,"DEF":30,"PHY":45},"league":"Другие лиги"},{"id":"academy_251","name":"Daniel Varga","pos":"GK","age":27,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":42,"price":15000,"type":"base","stats":{"DIV":43,"HAN":44,"KIC":39,"REF":45,"SPD":35,"POS":43},"league":"Другие лиги"},{"id":"academy_252","name":"Samuel Varga","pos":"CB","age":28,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":43,"price":17000,"type":"base","stats":{"PAC":36,"SHO":30,"PAS":42,"DRI":33,"DEF":52,"PHY":50},"league":"Другие лиги"},{"id":"academy_253","name":"Rayan Varga","pos":"LB","age":17,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":44,"price":19000,"type":"base","stats":{"PAC":47,"SHO":30,"PAS":43,"DRI":43,"DEF":46,"PHY":46},"league":"Другие лиги"},{"id":"academy_254","name":"Iker Varga","pos":"RB","age":18,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":45,"price":21000,"type":"base","stats":{"PAC":48,"SHO":31,"PAS":44,"DRI":44,"DEF":47,"PHY":47},"league":"Другие лиги"},{"id":"academy_255","name":"Nico Varga","pos":"CDM","age":19,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":46,"price":23000,"type":"base","stats":{"PAC":43,"SHO":35,"PAS":47,"DRI":44,"DEF":51,"PHY":53},"league":"Другие лиги"},{"id":"academy_256","name":"Artem Varga","pos":"CM","age":20,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":47,"price":26000,"type":"base","stats":{"PAC":46,"SHO":45,"PAS":51,"DRI":49,"DEF":43,"PHY":49},"league":"Другие лиги"},{"id":"academy_257","name":"Maksim Varga","pos":"CAM","age":21,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":48,"price":29000,"type":"base","stats":{"PAC":49,"SHO":51,"PAS":53,"DRI":54,"DEF":33,"PHY":43},"league":"Другие лиги"},{"id":"academy_258","name":"Daniil Varga","pos":"LW","age":22,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":49,"price":32000,"type":"base","stats":{"PAC":57,"SHO":51,"PAS":52,"DRI":53,"DEF":32,"PHY":49},"league":"Другие лиги"},{"id":"academy_259","name":"Ivan Varga","pos":"RW","age":23,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":50,"price":36000,"type":"base","stats":{"PAC":54,"SHO":53,"PAS":53,"DRI":55,"DEF":34,"PHY":46},"league":"Другие лиги"},{"id":"academy_260","name":"Mark Varga","pos":"ST","age":24,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":51,"price":40000,"type":"base","stats":{"PAC":55,"SHO":59,"PAS":48,"DRI":54,"DEF":31,"PHY":55},"league":"Другие лиги"},{"id":"academy_261","name":"Alex Rossi","pos":"GK","age":25,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":52,"price":44000,"type":"base","stats":{"DIV":55,"HAN":51,"KIC":51,"REF":52,"SPD":47,"POS":55},"league":"Другие лиги"},{"id":"academy_262","name":"Noah Rossi","pos":"CB","age":26,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":53,"price":49000,"type":"base","stats":{"PAC":48,"SHO":35,"PAS":49,"DRI":45,"DEF":59,"PHY":62},"league":"Другие лиги"},{"id":"academy_263","name":"Luca Rossi","pos":"LB","age":27,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":54,"price":55000,"type":"base","stats":{"PAC":56,"SHO":39,"PAS":52,"DRI":52,"DEF":60,"PHY":55},"league":"Другие лиги"},{"id":"academy_264","name":"Mateo Rossi","pos":"RB","age":28,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":55,"price":61000,"type":"base","stats":{"PAC":58,"SHO":41,"PAS":54,"DRI":54,"DEF":57,"PHY":57},"league":"Другие лиги"},{"id":"academy_265","name":"Elias Rossi","pos":"CDM","age":17,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":56,"price":68000,"type":"base","stats":{"PAC":52,"SHO":44,"PAS":56,"DRI":53,"DEF":65,"PHY":62},"league":"Другие лиги"},{"id":"academy_266","name":"Milan Rossi","pos":"CM","age":18,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":57,"price":76000,"type":"base","stats":{"PAC":56,"SHO":55,"PAS":61,"DRI":59,"DEF":53,"PHY":59},"league":"Другие лиги"},{"id":"academy_267","name":"Theo Rossi","pos":"CAM","age":19,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":58,"price":85000,"type":"base","stats":{"PAC":60,"SHO":57,"PAS":64,"DRI":65,"DEF":44,"PHY":54},"league":"Другие лиги"},{"id":"academy_268","name":"Adam Rossi","pos":"LW","age":20,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":59,"price":95000,"type":"base","stats":{"PAC":65,"SHO":64,"PAS":60,"DRI":66,"DEF":40,"PHY":57},"league":"Другие лиги"},{"id":"academy_269","name":"Oscar Rossi","pos":"RW","age":21,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":60,"price":106000,"type":"base","stats":{"PAC":66,"SHO":65,"PAS":60,"DRI":67,"DEF":41,"PHY":58},"league":"Другие лиги"},{"id":"academy_270","name":"Leo Rossi","pos":"ST","age":22,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":61,"price":118000,"type":"base","stats":{"PAC":66,"SHO":65,"PAS":59,"DRI":65,"DEF":42,"PHY":66},"league":"Другие лиги"},{"id":"academy_271","name":"Daniel Rossi","pos":"GK","age":23,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":62,"price":132000,"type":"base","stats":{"DIV":64,"HAN":60,"KIC":60,"REF":66,"SPD":56,"POS":64},"league":"Другие лиги"},{"id":"academy_272","name":"Samuel Rossi","pos":"CB","age":24,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":63,"price":147000,"type":"base","stats":{"PAC":59,"SHO":41,"PAS":60,"DRI":56,"DEF":70,"PHY":73},"league":"Другие лиги"},{"id":"academy_273","name":"Rayan Rossi","pos":"LB","age":25,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":64,"price":164000,"type":"base","stats":{"PAC":65,"SHO":48,"PAS":66,"DRI":61,"DEF":69,"PHY":64},"league":"Другие лиги"},{"id":"academy_274","name":"Iker Rossi","pos":"RB","age":26,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":65,"price":182000,"type":"base","stats":{"PAC":66,"SHO":49,"PAS":67,"DRI":62,"DEF":70,"PHY":65},"league":"Другие лиги"},{"id":"academy_275","name":"Nico Rossi","pos":"CDM","age":27,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":66,"price":203000,"type":"base","stats":{"PAC":64,"SHO":51,"PAS":68,"DRI":65,"DEF":72,"PHY":74},"league":"Другие лиги"},{"id":"academy_276","name":"Artem Rossi","pos":"CM","age":28,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":67,"price":227000,"type":"base","stats":{"PAC":67,"SHO":61,"PAS":72,"DRI":70,"DEF":64,"PHY":70},"league":"Другие лиги"},{"id":"academy_277","name":"Maksim Rossi","pos":"CAM","age":17,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":68,"price":253000,"type":"base","stats":{"PAC":70,"SHO":67,"PAS":74,"DRI":75,"DEF":54,"PHY":64},"league":"Другие лиги"},{"id":"academy_278","name":"Daniil Rossi","pos":"LW","age":18,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":69,"price":282000,"type":"base","stats":{"PAC":75,"SHO":74,"PAS":70,"DRI":76,"DEF":50,"PHY":67},"league":"Другие лиги"},{"id":"academy_279","name":"Ivan Rossi","pos":"RW","age":19,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":70,"price":314000,"type":"base","stats":{"PAC":77,"SHO":71,"PAS":71,"DRI":78,"DEF":52,"PHY":69},"league":"Другие лиги"},{"id":"academy_280","name":"Mark Rossi","pos":"ST","age":20,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":40,"price":12000,"type":"base","stats":{"PAC":42,"SHO":46,"PAS":40,"DRI":41,"DEF":30,"PHY":42},"league":"Другие лиги"},{"id":"academy_281","name":"Alex Dubois","pos":"GK","age":21,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":41,"price":13000,"type":"base","stats":{"DIV":41,"HAN":42,"KIC":37,"REF":43,"SPD":38,"POS":41},"league":"Другие лиги"},{"id":"academy_282","name":"Noah Dubois","pos":"CB","age":22,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":42,"price":15000,"type":"base","stats":{"PAC":37,"SHO":30,"PAS":38,"DRI":34,"DEF":48,"PHY":51},"league":"Другие лиги"},{"id":"academy_283","name":"Luca Dubois","pos":"LB","age":23,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":43,"price":17000,"type":"base","stats":{"PAC":47,"SHO":30,"PAS":43,"DRI":43,"DEF":46,"PHY":46},"league":"Другие лиги"},{"id":"academy_284","name":"Mateo Dubois","pos":"RB","age":24,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":44,"price":19000,"type":"base","stats":{"PAC":47,"SHO":30,"PAS":43,"DRI":43,"DEF":46,"PHY":46},"league":"Другие лиги"},{"id":"academy_285","name":"Elias Dubois","pos":"CDM","age":25,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":45,"price":21000,"type":"base","stats":{"PAC":43,"SHO":30,"PAS":47,"DRI":44,"DEF":51,"PHY":53},"league":"Другие лиги"},{"id":"academy_286","name":"Milan Dubois","pos":"CM","age":26,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":46,"price":23000,"type":"base","stats":{"PAC":47,"SHO":41,"PAS":52,"DRI":45,"DEF":44,"PHY":50},"league":"Другие лиги"},{"id":"academy_287","name":"Theo Dubois","pos":"CAM","age":27,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":47,"price":26000,"type":"base","stats":{"PAC":46,"SHO":48,"PAS":55,"DRI":51,"DEF":35,"PHY":40},"league":"Другие лиги"},{"id":"academy_288","name":"Adam Dubois","pos":"LW","age":28,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":48,"price":29000,"type":"base","stats":{"PAC":56,"SHO":50,"PAS":51,"DRI":52,"DEF":31,"PHY":48},"league":"Другие лиги"},{"id":"academy_289","name":"Oscar Dubois","pos":"RW","age":17,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":49,"price":32000,"type":"base","stats":{"PAC":57,"SHO":51,"PAS":51,"DRI":53,"DEF":32,"PHY":49},"league":"Другие лиги"},{"id":"academy_290","name":"Leo Dubois","pos":"ST","age":18,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":50,"price":36000,"type":"base","stats":{"PAC":52,"SHO":56,"PAS":50,"DRI":51,"DEF":33,"PHY":52},"league":"Другие лиги"},{"id":"academy_291","name":"Daniel Dubois","pos":"GK","age":19,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":51,"price":40000,"type":"base","stats":{"DIV":50,"HAN":51,"KIC":51,"REF":52,"SPD":47,"POS":50},"league":"Другие лиги"},{"id":"academy_292","name":"Samuel Dubois","pos":"CB","age":20,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":52,"price":44000,"type":"base","stats":{"PAC":48,"SHO":30,"PAS":49,"DRI":45,"DEF":59,"PHY":62},"league":"Другие лиги"},{"id":"academy_293","name":"Rayan Dubois","pos":"LB","age":21,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":53,"price":49000,"type":"base","stats":{"PAC":56,"SHO":39,"PAS":52,"DRI":52,"DEF":55,"PHY":55},"league":"Другие лиги"},{"id":"academy_294","name":"Iker Dubois","pos":"RB","age":22,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":54,"price":55000,"type":"base","stats":{"PAC":57,"SHO":40,"PAS":53,"DRI":53,"DEF":56,"PHY":56},"league":"Другие лиги"},{"id":"academy_295","name":"Nico Dubois","pos":"CDM","age":23,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":55,"price":61000,"type":"base","stats":{"PAC":50,"SHO":42,"PAS":59,"DRI":51,"DEF":63,"PHY":60},"league":"Другие лиги"},{"id":"academy_296","name":"Artem Dubois","pos":"CM","age":24,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":56,"price":68000,"type":"base","stats":{"PAC":53,"SHO":52,"PAS":63,"DRI":56,"DEF":55,"PHY":56},"league":"Другие лиги"},{"id":"academy_297","name":"Maksim Dubois","pos":"CAM","age":25,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":57,"price":76000,"type":"base","stats":{"PAC":56,"SHO":58,"PAS":65,"DRI":61,"DEF":45,"PHY":50},"league":"Другие лиги"},{"id":"academy_298","name":"Daniil Dubois","pos":"LW","age":26,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":58,"price":85000,"type":"base","stats":{"PAC":64,"SHO":63,"PAS":59,"DRI":65,"DEF":39,"PHY":56},"league":"Другие лиги"},{"id":"academy_299","name":"Ivan Dubois","pos":"RW","age":27,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":59,"price":95000,"type":"base","stats":{"PAC":66,"SHO":60,"PAS":60,"DRI":67,"DEF":41,"PHY":58},"league":"Другие лиги"},{"id":"academy_300","name":"Mark Dubois","pos":"ST","age":28,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":60,"price":106000,"type":"base","stats":{"PAC":64,"SHO":68,"PAS":57,"DRI":63,"DEF":40,"PHY":64},"league":"Другие лиги"},{"id":"academy_301","name":"Alex Volkov","pos":"GK","age":17,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":61,"price":118000,"type":"base","stats":{"DIV":60,"HAN":61,"KIC":61,"REF":62,"SPD":57,"POS":60},"league":"Другие лиги"},{"id":"academy_302","name":"Noah Volkov","pos":"CB","age":18,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":62,"price":132000,"type":"base","stats":{"PAC":58,"SHO":40,"PAS":59,"DRI":55,"DEF":69,"PHY":72},"league":"Другие лиги"},{"id":"academy_303","name":"Luca Volkov","pos":"LB","age":19,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":63,"price":147000,"type":"base","stats":{"PAC":66,"SHO":49,"PAS":62,"DRI":62,"DEF":65,"PHY":65},"league":"Другие лиги"},{"id":"academy_304","name":"Mateo Volkov","pos":"RB","age":20,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":64,"price":164000,"type":"base","stats":{"PAC":68,"SHO":46,"PAS":64,"DRI":64,"DEF":67,"PHY":67},"league":"Другие лиги"},{"id":"academy_305","name":"Elias Volkov","pos":"CDM","age":21,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":65,"price":182000,"type":"base","stats":{"PAC":62,"SHO":54,"PAS":66,"DRI":63,"DEF":70,"PHY":72},"league":"Другие лиги"},{"id":"academy_306","name":"Milan Volkov","pos":"CM","age":22,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":66,"price":203000,"type":"base","stats":{"PAC":66,"SHO":60,"PAS":71,"DRI":69,"DEF":63,"PHY":69},"league":"Другие лиги"},{"id":"academy_307","name":"Theo Volkov","pos":"CAM","age":23,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":67,"price":227000,"type":"base","stats":{"PAC":70,"SHO":67,"PAS":74,"DRI":70,"DEF":54,"PHY":64},"league":"Другие лиги"},{"id":"academy_308","name":"Adam Volkov","pos":"LW","age":24,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":68,"price":253000,"type":"base","stats":{"PAC":75,"SHO":69,"PAS":70,"DRI":76,"DEF":50,"PHY":67},"league":"Другие лиги"},{"id":"academy_309","name":"Oscar Volkov","pos":"RW","age":25,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":69,"price":282000,"type":"base","stats":{"PAC":76,"SHO":70,"PAS":70,"DRI":77,"DEF":51,"PHY":68},"league":"Другие лиги"},{"id":"academy_310","name":"Leo Volkov","pos":"ST","age":26,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":70,"price":314000,"type":"base","stats":{"PAC":76,"SHO":75,"PAS":69,"DRI":70,"DEF":52,"PHY":76},"league":"Другие лиги"},{"id":"academy_311","name":"Daniel Volkov","pos":"GK","age":27,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":40,"price":12000,"type":"base","stats":{"DIV":43,"HAN":39,"KIC":39,"REF":40,"SPD":35,"POS":43},"league":"Другие лиги"},{"id":"academy_312","name":"Samuel Volkov","pos":"CB","age":28,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":41,"price":13000,"type":"base","stats":{"PAC":36,"SHO":30,"PAS":37,"DRI":33,"DEF":47,"PHY":50},"league":"Другие лиги"},{"id":"academy_313","name":"Rayan Volkov","pos":"LB","age":17,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":42,"price":15000,"type":"base","stats":{"PAC":44,"SHO":30,"PAS":40,"DRI":40,"DEF":48,"PHY":43},"league":"Другие лиги"},{"id":"academy_314","name":"Iker Volkov","pos":"RB","age":18,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":43,"price":17000,"type":"base","stats":{"PAC":45,"SHO":30,"PAS":41,"DRI":41,"DEF":49,"PHY":44},"league":"Другие лиги"},{"id":"academy_315","name":"Nico Volkov","pos":"CDM","age":19,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":44,"price":19000,"type":"base","stats":{"PAC":43,"SHO":30,"PAS":47,"DRI":39,"DEF":51,"PHY":53},"league":"Другие лиги"},{"id":"academy_316","name":"Artem Volkov","pos":"CM","age":20,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":45,"price":21000,"type":"base","stats":{"PAC":46,"SHO":40,"PAS":51,"DRI":44,"DEF":43,"PHY":49},"league":"Другие лиги"},{"id":"academy_317","name":"Maksim Volkov","pos":"CAM","age":21,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":46,"price":23000,"type":"base","stats":{"PAC":49,"SHO":46,"PAS":53,"DRI":49,"DEF":33,"PHY":43},"league":"Другие лиги"},{"id":"academy_318","name":"Daniil Volkov","pos":"LW","age":22,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":47,"price":26000,"type":"base","stats":{"PAC":54,"SHO":48,"PAS":49,"DRI":55,"DEF":30,"PHY":46},"league":"Другие лиги"},{"id":"academy_319","name":"Ivan Volkov","pos":"RW","age":23,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":48,"price":29000,"type":"base","stats":{"PAC":54,"SHO":53,"PAS":48,"DRI":55,"DEF":30,"PHY":46},"league":"Другие лиги"},{"id":"academy_320","name":"Mark Volkov","pos":"ST","age":24,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":49,"price":32000,"type":"base","stats":{"PAC":52,"SHO":56,"PAS":45,"DRI":51,"DEF":33,"PHY":52},"league":"Другие лиги"},{"id":"academy_321","name":"Alex Smirnov","pos":"GK","age":25,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":50,"price":36000,"type":"base","stats":{"DIV":51,"HAN":52,"KIC":47,"REF":53,"SPD":43,"POS":51},"league":"Другие лиги"},{"id":"academy_322","name":"Noah Smirnov","pos":"CB","age":26,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":51,"price":40000,"type":"base","stats":{"PAC":44,"SHO":31,"PAS":50,"DRI":41,"DEF":60,"PHY":58},"league":"Другие лиги"},{"id":"academy_323","name":"Luca Smirnov","pos":"LB","age":27,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":52,"price":44000,"type":"base","stats":{"PAC":57,"SHO":35,"PAS":53,"DRI":48,"DEF":56,"PHY":56},"league":"Другие лиги"},{"id":"academy_324","name":"Mateo Smirnov","pos":"RB","age":28,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":53,"price":49000,"type":"base","stats":{"PAC":54,"SHO":37,"PAS":55,"DRI":50,"DEF":58,"PHY":53},"league":"Другие лиги"},{"id":"academy_325","name":"Elias Smirnov","pos":"CDM","age":17,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":54,"price":55000,"type":"base","stats":{"PAC":53,"SHO":40,"PAS":57,"DRI":49,"DEF":61,"PHY":63},"league":"Другие лиги"},{"id":"academy_326","name":"Milan Smirnov","pos":"CM","age":18,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":55,"price":61000,"type":"base","stats":{"PAC":54,"SHO":53,"PAS":59,"DRI":57,"DEF":51,"PHY":57},"league":"Другие лиги"},{"id":"academy_327","name":"Theo Smirnov","pos":"CAM","age":19,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":56,"price":68000,"type":"base","stats":{"PAC":58,"SHO":55,"PAS":62,"DRI":63,"DEF":42,"PHY":52},"league":"Другие лиги"},{"id":"academy_328","name":"Adam Smirnov","pos":"LW","age":20,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":57,"price":76000,"type":"base","stats":{"PAC":63,"SHO":62,"PAS":58,"DRI":64,"DEF":38,"PHY":55},"league":"Другие лиги"},{"id":"academy_329","name":"Oscar Smirnov","pos":"RW","age":21,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":58,"price":85000,"type":"base","stats":{"PAC":64,"SHO":63,"PAS":58,"DRI":65,"DEF":39,"PHY":56},"league":"Другие лиги"},{"id":"academy_330","name":"Leo Smirnov","pos":"ST","age":22,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":59,"price":95000,"type":"base","stats":{"PAC":64,"SHO":63,"PAS":57,"DRI":63,"DEF":40,"PHY":64},"league":"Другие лиги"},{"id":"academy_331","name":"Daniel Smirnov","pos":"GK","age":23,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":60,"price":106000,"type":"base","stats":{"DIV":62,"HAN":58,"KIC":58,"REF":64,"SPD":54,"POS":62},"league":"Другие лиги"},{"id":"academy_332","name":"Samuel Smirnov","pos":"CB","age":24,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":61,"price":118000,"type":"base","stats":{"PAC":55,"SHO":42,"PAS":56,"DRI":52,"DEF":71,"PHY":69},"league":"Другие лиги"},{"id":"academy_333","name":"Rayan Smirnov","pos":"LB","age":25,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":62,"price":132000,"type":"base","stats":{"PAC":66,"SHO":44,"PAS":62,"DRI":62,"DEF":65,"PHY":65},"league":"Другие лиги"},{"id":"academy_334","name":"Iker Smirnov","pos":"RB","age":26,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":63,"price":147000,"type":"base","stats":{"PAC":67,"SHO":45,"PAS":63,"DRI":63,"DEF":66,"PHY":66},"league":"Другие лиги"},{"id":"academy_335","name":"Nico Smirnov","pos":"CDM","age":27,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":64,"price":164000,"type":"base","stats":{"PAC":62,"SHO":49,"PAS":66,"DRI":63,"DEF":70,"PHY":72},"league":"Другие лиги"},{"id":"academy_336","name":"Artem Smirnov","pos":"CM","age":28,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":65,"price":182000,"type":"base","stats":{"PAC":65,"SHO":59,"PAS":70,"DRI":68,"DEF":62,"PHY":68},"league":"Другие лиги"},{"id":"academy_337","name":"Maksim Smirnov","pos":"CAM","age":17,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":66,"price":203000,"type":"base","stats":{"PAC":68,"SHO":65,"PAS":72,"DRI":73,"DEF":52,"PHY":62},"league":"Другие лиги"},{"id":"academy_338","name":"Daniil Smirnov","pos":"LW","age":18,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":67,"price":227000,"type":"base","stats":{"PAC":71,"SHO":70,"PAS":71,"DRI":72,"DEF":51,"PHY":63},"league":"Другие лиги"},{"id":"academy_339","name":"Ivan Smirnov","pos":"RW","age":19,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":68,"price":253000,"type":"base","stats":{"PAC":73,"SHO":72,"PAS":67,"DRI":74,"DEF":53,"PHY":65},"league":"Другие лиги"},{"id":"academy_340","name":"Mark Smirnov","pos":"ST","age":20,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":69,"price":282000,"type":"base","stats":{"PAC":74,"SHO":73,"PAS":67,"DRI":73,"DEF":50,"PHY":74},"league":"Другие лиги"},{"id":"academy_341","name":"Alex Orlov","pos":"GK","age":21,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":70,"price":314000,"type":"base","stats":{"DIV":70,"HAN":71,"KIC":66,"REF":72,"SPD":67,"POS":70},"league":"Другие лиги"},{"id":"academy_342","name":"Noah Orlov","pos":"CB","age":22,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":40,"price":12000,"type":"base","stats":{"PAC":35,"SHO":30,"PAS":36,"DRI":32,"DEF":46,"PHY":49},"league":"Другие лиги"},{"id":"academy_343","name":"Luca Orlov","pos":"LB","age":23,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":41,"price":13000,"type":"base","stats":{"PAC":45,"SHO":30,"PAS":41,"DRI":41,"DEF":44,"PHY":44},"league":"Другие лиги"},{"id":"academy_344","name":"Mateo Orlov","pos":"RB","age":24,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":42,"price":15000,"type":"base","stats":{"PAC":45,"SHO":30,"PAS":41,"DRI":41,"DEF":44,"PHY":44},"league":"Другие лиги"},{"id":"academy_345","name":"Elias Orlov","pos":"CDM","age":25,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":43,"price":17000,"type":"base","stats":{"PAC":41,"SHO":30,"PAS":45,"DRI":42,"DEF":49,"PHY":51},"league":"Другие лиги"},{"id":"academy_346","name":"Milan Orlov","pos":"CM","age":26,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":44,"price":19000,"type":"base","stats":{"PAC":45,"SHO":39,"PAS":50,"DRI":43,"DEF":42,"PHY":48},"league":"Другие лиги"},{"id":"academy_347","name":"Theo Orlov","pos":"CAM","age":27,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":45,"price":21000,"type":"base","stats":{"PAC":44,"SHO":46,"PAS":53,"DRI":49,"DEF":33,"PHY":38},"league":"Другие лиги"},{"id":"academy_348","name":"Adam Orlov","pos":"LW","age":28,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":46,"price":23000,"type":"base","stats":{"PAC":54,"SHO":48,"PAS":49,"DRI":50,"DEF":30,"PHY":46},"league":"Другие лиги"},{"id":"academy_349","name":"Oscar Orlov","pos":"RW","age":17,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":47,"price":26000,"type":"base","stats":{"PAC":55,"SHO":49,"PAS":49,"DRI":51,"DEF":30,"PHY":47},"league":"Другие лиги"},{"id":"academy_350","name":"Leo Orlov","pos":"ST","age":18,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":48,"price":29000,"type":"base","stats":{"PAC":50,"SHO":54,"PAS":48,"DRI":49,"DEF":31,"PHY":50},"league":"Другие лиги"},{"id":"academy_351","name":"Daniel Orlov","pos":"GK","age":19,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":49,"price":32000,"type":"base","stats":{"DIV":48,"HAN":49,"KIC":49,"REF":50,"SPD":45,"POS":48},"league":"Другие лиги"},{"id":"academy_352","name":"Samuel Orlov","pos":"CB","age":20,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":50,"price":36000,"type":"base","stats":{"PAC":46,"SHO":30,"PAS":47,"DRI":43,"DEF":57,"PHY":60},"league":"Другие лиги"},{"id":"academy_353","name":"Rayan Orlov","pos":"LB","age":21,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":51,"price":40000,"type":"base","stats":{"PAC":54,"SHO":37,"PAS":50,"DRI":50,"DEF":53,"PHY":53},"league":"Другие лиги"},{"id":"academy_354","name":"Iker Orlov","pos":"RB","age":22,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":52,"price":44000,"type":"base","stats":{"PAC":55,"SHO":38,"PAS":51,"DRI":51,"DEF":54,"PHY":54},"league":"Другие лиги"},{"id":"academy_355","name":"Nico Orlov","pos":"CDM","age":23,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":53,"price":49000,"type":"base","stats":{"PAC":48,"SHO":40,"PAS":57,"DRI":49,"DEF":61,"PHY":58},"league":"Другие лиги"},{"id":"academy_356","name":"Artem Orlov","pos":"CM","age":24,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":54,"price":55000,"type":"base","stats":{"PAC":51,"SHO":50,"PAS":61,"DRI":54,"DEF":53,"PHY":54},"league":"Другие лиги"},{"id":"academy_357","name":"Maksim Orlov","pos":"CAM","age":25,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":55,"price":61000,"type":"base","stats":{"PAC":54,"SHO":56,"PAS":63,"DRI":59,"DEF":43,"PHY":48},"league":"Другие лиги"},{"id":"academy_358","name":"Daniil Orlov","pos":"LW","age":26,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":56,"price":68000,"type":"base","stats":{"PAC":62,"SHO":61,"PAS":57,"DRI":63,"DEF":37,"PHY":54},"league":"Другие лиги"},{"id":"academy_359","name":"Ivan Orlov","pos":"RW","age":27,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":57,"price":76000,"type":"base","stats":{"PAC":64,"SHO":58,"PAS":58,"DRI":65,"DEF":39,"PHY":56},"league":"Другие лиги"},{"id":"academy_360","name":"Mark Orlov","pos":"ST","age":28,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":58,"price":85000,"type":"base","stats":{"PAC":62,"SHO":66,"PAS":55,"DRI":61,"DEF":38,"PHY":62},"league":"Другие лиги"},{"id":"academy_361","name":"Alex Klein","pos":"GK","age":17,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":59,"price":95000,"type":"base","stats":{"DIV":61,"HAN":57,"KIC":57,"REF":63,"SPD":53,"POS":61},"league":"Другие лиги"},{"id":"academy_362","name":"Noah Klein","pos":"CB","age":18,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":60,"price":106000,"type":"base","stats":{"PAC":54,"SHO":41,"PAS":55,"DRI":51,"DEF":70,"PHY":68},"league":"Другие лиги"},{"id":"academy_363","name":"Luca Klein","pos":"LB","age":19,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":61,"price":118000,"type":"base","stats":{"PAC":62,"SHO":45,"PAS":63,"DRI":58,"DEF":66,"PHY":61},"league":"Другие лиги"},{"id":"academy_364","name":"Mateo Klein","pos":"RB","age":20,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":62,"price":132000,"type":"base","stats":{"PAC":64,"SHO":47,"PAS":60,"DRI":60,"DEF":68,"PHY":63},"league":"Другие лиги"},{"id":"academy_365","name":"Elias Klein","pos":"CDM","age":21,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":63,"price":147000,"type":"base","stats":{"PAC":58,"SHO":50,"PAS":67,"DRI":59,"DEF":71,"PHY":68},"league":"Другие лиги"},{"id":"academy_366","name":"Milan Klein","pos":"CM","age":22,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":64,"price":164000,"type":"base","stats":{"PAC":64,"SHO":58,"PAS":69,"DRI":67,"DEF":61,"PHY":67},"league":"Другие лиги"},{"id":"academy_367","name":"Theo Klein","pos":"CAM","age":23,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":65,"price":182000,"type":"base","stats":{"PAC":66,"SHO":68,"PAS":70,"DRI":71,"DEF":50,"PHY":60},"league":"Другие лиги"},{"id":"academy_368","name":"Adam Klein","pos":"LW","age":24,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":66,"price":203000,"type":"base","stats":{"PAC":73,"SHO":67,"PAS":68,"DRI":74,"DEF":48,"PHY":65},"league":"Другие лиги"},{"id":"academy_369","name":"Oscar Klein","pos":"RW","age":25,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":67,"price":227000,"type":"base","stats":{"PAC":74,"SHO":68,"PAS":68,"DRI":75,"DEF":49,"PHY":66},"league":"Другие лиги"},{"id":"academy_370","name":"Leo Klein","pos":"ST","age":26,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":68,"price":253000,"type":"base","stats":{"PAC":72,"SHO":76,"PAS":65,"DRI":71,"DEF":48,"PHY":72},"league":"Другие лиги"},{"id":"academy_371","name":"Daniel Klein","pos":"GK","age":27,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":69,"price":282000,"type":"base","stats":{"DIV":70,"HAN":71,"KIC":66,"REF":72,"SPD":62,"POS":70},"league":"Другие лиги"},{"id":"academy_372","name":"Samuel Klein","pos":"CB","age":28,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":70,"price":314000,"type":"base","stats":{"PAC":65,"SHO":52,"PAS":66,"DRI":62,"DEF":76,"PHY":79},"league":"Другие лиги"},{"id":"academy_373","name":"Rayan Klein","pos":"LB","age":17,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":40,"price":12000,"type":"base","stats":{"PAC":45,"SHO":30,"PAS":41,"DRI":36,"DEF":44,"PHY":44},"league":"Другие лиги"},{"id":"academy_374","name":"Iker Klein","pos":"RB","age":18,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":41,"price":13000,"type":"base","stats":{"PAC":46,"SHO":30,"PAS":42,"DRI":37,"DEF":45,"PHY":45},"league":"Другие лиги"},{"id":"academy_375","name":"Nico Klein","pos":"CDM","age":19,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":42,"price":15000,"type":"base","stats":{"PAC":39,"SHO":31,"PAS":43,"DRI":40,"DEF":47,"PHY":49},"league":"Другие лиги"},{"id":"academy_376","name":"Artem Klein","pos":"CM","age":20,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":43,"price":17000,"type":"base","stats":{"PAC":42,"SHO":41,"PAS":47,"DRI":45,"DEF":39,"PHY":45},"league":"Другие лиги"},{"id":"academy_377","name":"Maksim Klein","pos":"CAM","age":21,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":44,"price":19000,"type":"base","stats":{"PAC":45,"SHO":47,"PAS":49,"DRI":50,"DEF":30,"PHY":39},"league":"Другие лиги"},{"id":"academy_378","name":"Daniil Klein","pos":"LW","age":22,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":45,"price":21000,"type":"base","stats":{"PAC":50,"SHO":49,"PAS":45,"DRI":51,"DEF":30,"PHY":42},"league":"Другие лиги"},{"id":"academy_379","name":"Ivan Klein","pos":"RW","age":23,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":46,"price":23000,"type":"base","stats":{"PAC":52,"SHO":51,"PAS":46,"DRI":53,"DEF":30,"PHY":44},"league":"Другие лиги"},{"id":"academy_380","name":"Mark Klein","pos":"ST","age":24,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":47,"price":26000,"type":"base","stats":{"PAC":53,"SHO":52,"PAS":46,"DRI":47,"DEF":30,"PHY":53},"league":"Другие лиги"},{"id":"academy_381","name":"Alex Marin","pos":"GK","age":25,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":48,"price":29000,"type":"base","stats":{"DIV":49,"HAN":50,"KIC":45,"REF":51,"SPD":41,"POS":49},"league":"Другие лиги"},{"id":"academy_382","name":"Noah Marin","pos":"CB","age":26,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":49,"price":32000,"type":"base","stats":{"PAC":45,"SHO":30,"PAS":46,"DRI":42,"DEF":56,"PHY":59},"league":"Другие лиги"},{"id":"academy_383","name":"Luca Marin","pos":"LB","age":27,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":50,"price":36000,"type":"base","stats":{"PAC":53,"SHO":36,"PAS":49,"DRI":49,"DEF":52,"PHY":52},"league":"Другие лиги"},{"id":"academy_384","name":"Mateo Marin","pos":"RB","age":28,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":51,"price":40000,"type":"base","stats":{"PAC":55,"SHO":33,"PAS":51,"DRI":51,"DEF":54,"PHY":54},"league":"Другие лиги"},{"id":"academy_385","name":"Elias Marin","pos":"CDM","age":17,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":52,"price":44000,"type":"base","stats":{"PAC":49,"SHO":41,"PAS":53,"DRI":50,"DEF":57,"PHY":59},"league":"Другие лиги"},{"id":"academy_386","name":"Milan Marin","pos":"CM","age":18,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":53,"price":49000,"type":"base","stats":{"PAC":50,"SHO":49,"PAS":60,"DRI":53,"DEF":52,"PHY":53},"league":"Другие лиги"},{"id":"academy_387","name":"Theo Marin","pos":"CAM","age":19,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":54,"price":55000,"type":"base","stats":{"PAC":54,"SHO":56,"PAS":58,"DRI":59,"DEF":43,"PHY":48},"league":"Другие лиги"},{"id":"academy_388","name":"Adam Marin","pos":"LW","age":20,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":55,"price":61000,"type":"base","stats":{"PAC":59,"SHO":58,"PAS":59,"DRI":60,"DEF":39,"PHY":51},"league":"Другие лиги"},{"id":"academy_389","name":"Oscar Marin","pos":"RW","age":21,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":56,"price":68000,"type":"base","stats":{"PAC":60,"SHO":59,"PAS":59,"DRI":61,"DEF":40,"PHY":52},"league":"Другие лиги"},{"id":"academy_390","name":"Leo Marin","pos":"ST","age":22,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":57,"price":76000,"type":"base","stats":{"PAC":60,"SHO":64,"PAS":53,"DRI":59,"DEF":41,"PHY":60},"league":"Другие лиги"},{"id":"academy_391","name":"Daniel Marin","pos":"GK","age":23,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":58,"price":85000,"type":"base","stats":{"DIV":58,"HAN":59,"KIC":54,"REF":60,"SPD":55,"POS":58},"league":"Другие лиги"},{"id":"academy_392","name":"Samuel Marin","pos":"CB","age":24,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":59,"price":95000,"type":"base","stats":{"PAC":56,"SHO":38,"PAS":57,"DRI":48,"DEF":67,"PHY":70},"league":"Другие лиги"},{"id":"academy_393","name":"Rayan Marin","pos":"LB","age":25,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":60,"price":106000,"type":"base","stats":{"PAC":64,"SHO":42,"PAS":60,"DRI":60,"DEF":63,"PHY":63},"league":"Другие лиги"},{"id":"academy_394","name":"Iker Marin","pos":"RB","age":26,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":61,"price":118000,"type":"base","stats":{"PAC":65,"SHO":43,"PAS":61,"DRI":61,"DEF":64,"PHY":64},"league":"Другие лиги"},{"id":"academy_395","name":"Nico Marin","pos":"CDM","age":27,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":62,"price":132000,"type":"base","stats":{"PAC":58,"SHO":50,"PAS":62,"DRI":59,"DEF":71,"PHY":68},"league":"Другие лиги"},{"id":"academy_396","name":"Artem Marin","pos":"CM","age":28,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":63,"price":147000,"type":"base","stats":{"PAC":61,"SHO":60,"PAS":66,"DRI":64,"DEF":63,"PHY":64},"league":"Другие лиги"},{"id":"academy_397","name":"Maksim Marin","pos":"CAM","age":17,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":64,"price":164000,"type":"base","stats":{"PAC":64,"SHO":66,"PAS":68,"DRI":69,"DEF":53,"PHY":58},"league":"Другие лиги"},{"id":"academy_398","name":"Daniil Marin","pos":"LW","age":18,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":65,"price":182000,"type":"base","stats":{"PAC":72,"SHO":66,"PAS":67,"DRI":73,"DEF":47,"PHY":64},"league":"Другие лиги"},{"id":"academy_399","name":"Ivan Marin","pos":"RW","age":19,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":66,"price":203000,"type":"base","stats":{"PAC":74,"SHO":68,"PAS":68,"DRI":70,"DEF":49,"PHY":66},"league":"Другие лиги"},{"id":"academy_400","name":"Mark Marin","pos":"ST","age":20,"nation":"Международная академия","club":"MR Academy","value":0,"ovr":67,"price":227000,"type":"base","stats":{"PAC":72,"SHO":71,"PAS":65,"DRI":71,"DEF":48,"PHY":72},"league":"Другие лиги"},{"name":"Ivan Oblyakov","pos":"CM","age":27,"nation":"Россия","club":"ЦСКА Москва","value":40.0,"id":"rpl_0902","ovr":80,"price":2816000,"type":"base","league":"РПЛ","stats":{"PAC":78,"SHO":76,"PAS":84,"DRI":79,"DEF":79,"PHY":80}},{"name":"Igor Akinfeev","pos":"GK","age":40,"nation":"Россия","club":"ЦСКА Москва","value":38.0,"id":"rpl_0903","ovr":79,"price":2746040,"type":"base","league":"РПЛ","stats":{"DIV":80,"HAN":79,"KIC":76,"REF":81,"SPD":77,"POS":79}},{"name":"Moisés","pos":"LB","age":31,"nation":"Бразилия","club":"ЦСКА Москва","value":34.0,"id":"rpl_0904","ovr":77,"price":2608760,"type":"base","league":"РПЛ","stats":{"PAC":82,"SHO":66,"PAS":76,"DRI":76,"DEF":86,"PHY":77}},{"name":"Tamerlan Musaev","pos":"ST","age":24,"nation":"Россия","club":"ЦСКА Москва","value":30.0,"id":"rpl_0905","ovr":75,"price":2475000,"type":"base","league":"РПЛ","stats":{"PAC":80,"SHO":79,"PAS":74,"DRI":74,"DEF":64,"PHY":81}},{"name":"Andrey Mostovoy","pos":"LW","age":28,"nation":"Россия","club":"Зенит","value":38.0,"id":"rpl_0906","ovr":79,"price":2746040,"type":"base","league":"РПЛ","stats":{"PAC":84,"SHO":83,"PAS":78,"DRI":84,"DEF":68,"PHY":79}},{"name":"Maksim Glushenkov","pos":"RW","age":27,"nation":"Россия","club":"Зенит","value":42.0,"id":"rpl_0907","ovr":81,"price":2886840,"type":"base","league":"РПЛ","stats":{"PAC":86,"SHO":85,"PAS":80,"DRI":86,"DEF":70,"PHY":81}},{"name":"Wendel","pos":"CM","age":28,"nation":"Бразилия","club":"Зенит","value":40.0,"id":"rpl_0908","ovr":80,"price":2816000,"type":"base","league":"РПЛ","stats":{"PAC":78,"SHO":76,"PAS":84,"DRI":79,"DEF":79,"PHY":80}},{"name":"Jhon Córdoba","pos":"ST","age":33,"nation":"Колумбия","club":"Краснодар","value":42.0,"id":"rpl_0909","ovr":81,"price":2886840,"type":"base","league":"РПЛ","stats":{"PAC":86,"SHO":85,"PAS":80,"DRI":80,"DEF":70,"PHY":87}},{"name":"Aleksandr Chernikov","pos":"CDM","age":26,"nation":"Россия","club":"Краснодар","value":34.0,"id":"rpl_0910","ovr":77,"price":2608760,"type":"base","league":"РПЛ","stats":{"PAC":75,"SHO":73,"PAS":81,"DRI":76,"DEF":86,"PHY":83}},{"name":"Manfred Ugalde","pos":"ST","age":24,"nation":"Коста-Рика","club":"Спартак Москва","value":40.0,"id":"rpl_0911","ovr":80,"price":2816000,"type":"base","league":"РПЛ","stats":{"PAC":85,"SHO":84,"PAS":79,"DRI":79,"DEF":69,"PHY":86}},{"name":"Esequiel Barco","pos":"CAM","age":27,"nation":"Аргентина","club":"Спартак Москва","value":38.0,"id":"rpl_0912","ovr":79,"price":2746040,"type":"base","league":"РПЛ","stats":{"PAC":77,"SHO":83,"PAS":83,"DRI":84,"DEF":78,"PHY":79}},{"name":"Dmitry Vorobyov","pos":"ST","age":28,"nation":"Россия","club":"Локомотив Москва","value":34.0,"id":"rpl_0913","ovr":77,"price":2608760,"type":"base","league":"РПЛ","stats":{"PAC":82,"SHO":81,"PAS":76,"DRI":76,"DEF":66,"PHY":83}},{"name":"Jerdy Schouten","pos":"CDM","age":29,"nation":"Нидерланды","club":"ПСВ Эйндховен","value":42.0,"id":"top10_0914","ovr":81,"price":2886840,"type":"base","league":"Нидерландская Эредивизи","stats":{"PAC":79,"SHO":77,"PAS":85,"DRI":80,"DEF":90,"PHY":87}},{"name":"Wout Weghorst","pos":"ST","age":34,"nation":"Нидерланды","club":"Аякс","value":34.0,"id":"top10_0915","ovr":77,"price":2608760,"type":"base","league":"Нидерландская Эредивизи","stats":{"PAC":82,"SHO":81,"PAS":76,"DRI":76,"DEF":66,"PHY":83}},{"name":"Ayase Ueda","pos":"ST","age":28,"nation":"Япония","club":"Фейеноорд Роттердам","value":36.0,"id":"top10_0916","ovr":78,"price":2676960,"type":"base","league":"Нидерландская Эредивизи","stats":{"PAC":83,"SHO":82,"PAS":77,"DRI":77,"DEF":67,"PHY":84}},{"name":"Raphael Veiga","pos":"CAM","age":31,"nation":"Бразилия","club":"Палмейрас","value":44.0,"id":"top10_0917","ovr":82,"price":2958560,"type":"base","league":"Бразильская Серия A","stats":{"PAC":80,"SHO":86,"PAS":86,"DRI":87,"DEF":81,"PHY":82}},{"name":"Gustavo Gómez","pos":"CB","age":33,"nation":"Парагвай","club":"Палмейрас","value":44.0,"id":"top10_0918","ovr":82,"price":2958560,"type":"base","league":"Бразильская Серия A","stats":{"PAC":80,"SHO":71,"PAS":81,"DRI":81,"DEF":91,"PHY":88}},{"name":"Pedro","pos":"ST","age":29,"nation":"Бразилия","club":"Фламенго","value":46.0,"id":"top10_0919","ovr":83,"price":3031160,"type":"base","league":"Бразильская Серия A","stats":{"PAC":88,"SHO":87,"PAS":82,"DRI":82,"DEF":72,"PHY":89}},{"name":"Giorgian de Arrascaeta","pos":"CAM","age":32,"nation":"Уругвай","club":"Фламенго","value":48.0,"id":"top10_0920","ovr":84,"price":3104640,"type":"base","league":"Бразильская Серия A","stats":{"PAC":82,"SHO":88,"PAS":88,"DRI":89,"DEF":83,"PHY":84}},{"name":"Neymar","pos":"LW","age":34,"nation":"Бразилия","club":"Сантос","value":44.0,"id":"top10_0921","ovr":82,"price":2958560,"type":"base","league":"Бразильская Серия A","stats":{"PAC":87,"SHO":86,"PAS":81,"DRI":87,"DEF":71,"PHY":82}},{"name":"Salem Al-Dawsari","pos":"LW","age":35,"nation":"Саудовская Аравия","club":"Аль-Хилаль Эр-Рияд","value":42.0,"id":"top10_0922","ovr":81,"price":2886840,"type":"base","league":"Саудовская Про-лига","stats":{"PAC":86,"SHO":85,"PAS":80,"DRI":86,"DEF":70,"PHY":81}},{"name":"Riyad Mahrez","pos":"RW","age":35,"nation":"Алжир","club":"Аль-Ахли","value":44.0,"id":"top10_0923","ovr":82,"price":2958560,"type":"base","league":"Саудовская Про-лига","stats":{"PAC":87,"SHO":86,"PAS":81,"DRI":87,"DEF":71,"PHY":82}},{"name":"Ivan Toney","pos":"ST","age":30,"nation":"Англия","club":"Аль-Ахли","value":46.0,"id":"top10_0924","ovr":83,"price":3031160,"type":"base","league":"Саудовская Про-лига","stats":{"PAC":88,"SHO":87,"PAS":82,"DRI":82,"DEF":72,"PHY":89}},{"name":"Karim Benzema","pos":"ST","age":38,"nation":"Франция","club":"Иттихад","value":44.0,"id":"top10_0925","ovr":82,"price":2958560,"type":"base","league":"Саудовская Про-лига","stats":{"PAC":87,"SHO":86,"PAS":81,"DRI":81,"DEF":71,"PHY":88}}];
const FCUC_EVENT_DB = [{"name":"Lamine Yamal","pos":"RW","age":19,"nation":"Испания","club":"Winter Wunderkind","value":220.0,"id":"evt_001","ovr":82,"price":0,"type":"event","stats":{"PAC":86,"SHO":85,"PAS":85,"DRI":87,"DEF":66,"PHY":78},"event":"winter","league":"Испанская Ла Лига","realClub":"Барселона","basePlayerId":"db_0001"},{"name":"Yan Diomande","pos":"RW","age":20,"nation":"Кот-д'Ивуар","club":"Winter Wunderkind","value":120.0,"id":"evt_002","ovr":82,"price":0,"type":"event","stats":{"PAC":90,"SHO":84,"PAS":84,"DRI":86,"DEF":65,"PHY":82},"event":"winter","league":"Испанская Ла Лига","realClub":"Реал Мадрид","basePlayerId":"db_0011"},{"name":"Pau Cubarsí","pos":"CB","age":19,"nation":"Испания","club":"Winter Wunderkind","value":100.0,"id":"evt_003","ovr":82,"price":0,"type":"event","stats":{"PAC":79,"SHO":61,"PAS":80,"DRI":71,"DEF":90,"PHY":93},"event":"winter","league":"Испанская Ла Лига","realClub":"Барселона","basePlayerId":"db_0022"},{"name":"Ayyoub Bouaddi","pos":"CDM","age":19,"nation":"Марокко / Франция","club":"Winter Wunderkind","value":90.0,"id":"evt_004","ovr":80,"price":0,"type":"event","stats":{"PAC":75,"SHO":67,"PAS":84,"DRI":76,"DEF":88,"PHY":85},"event":"winter","league":"Английская Премьер-лига","realClub":"Манчестер Сити","basePlayerId":"db_0030"},{"name":"Estêvão","pos":"RW","age":19,"nation":"Бразилия","club":"Winter Wunderkind","value":80.0,"id":"evt_005","ovr":80,"price":0,"type":"event","stats":{"PAC":84,"SHO":83,"PAS":83,"DRI":85,"DEF":64,"PHY":76},"event":"winter","league":"Английская Премьер-лига","realClub":"Челси","basePlayerId":"db_0037"},{"name":"Warren Zaïre-Emery","pos":"CM","age":20,"nation":"Франция / Мартиника","club":"Winter Wunderkind","value":80.0,"id":"evt_006","ovr":80,"price":0,"type":"event","stats":{"PAC":79,"SHO":78,"PAS":84,"DRI":82,"DEF":76,"PHY":82},"event":"winter","league":"Французская Лига 1","realClub":"Пари Сен-Жермен","basePlayerId":"db_0038"},{"name":"Junior Kroupi","pos":"ST","age":20,"nation":"Франция / Португалия","club":"Winter Wunderkind","value":70.0,"id":"evt_007","ovr":78,"price":0,"type":"event","stats":{"PAC":84,"SHO":83,"PAS":77,"DRI":78,"DEF":60,"PHY":84},"event":"winter","league":"Английская Премьер-лига","realClub":"Борнмут","basePlayerId":"db_0063"},{"name":"Luka Vuskovic","pos":"CB","age":19,"nation":"Хорватия","club":"Winter Wunderkind","value":65.0,"id":"evt_008","ovr":78,"price":0,"type":"event","stats":{"PAC":74,"SHO":56,"PAS":75,"DRI":71,"DEF":85,"PHY":88},"event":"winter","league":"Английская Премьер-лига","realClub":"Брайтон энд Хоув Альбион","basePlayerId":"db_0073"},{"name":"Myles Lewis-Skelly","pos":"CDM","age":20,"nation":"Англия / Барбадос","club":"Winter Wunderkind","value":65.0,"id":"evt_009","ovr":78,"price":0,"type":"event","stats":{"PAC":75,"SHO":67,"PAS":79,"DRI":76,"DEF":83,"PHY":85},"event":"winter","league":"Английская Премьер-лига","realClub":"Арсенал","basePlayerId":"db_0074"},{"name":"Lennart Karl","pos":"CAM","age":18,"nation":"Германия","club":"Winter Wunderkind","value":60.0,"id":"evt_010","ovr":76,"price":0,"type":"event","stats":{"PAC":79,"SHO":76,"PAS":83,"DRI":79,"DEF":63,"PHY":73},"event":"winter","league":"Немецкая Бундеслига","realClub":"Бавария Мюнхен","basePlayerId":"db_0086"},{"name":"Rayan","pos":"RW","age":20,"nation":"Бразилия","club":"Winter Wunderkind","value":60.0,"id":"evt_011","ovr":76,"price":0,"type":"event","stats":{"PAC":80,"SHO":79,"PAS":79,"DRI":81,"DEF":60,"PHY":72},"event":"winter","league":"Английская Премьер-лига","realClub":"Борнмут","basePlayerId":"db_0087"},{"name":"Max Dowman","pos":"RW","age":16,"nation":"Англия","club":"Winter Wunderkind","value":50.0,"id":"evt_012","ovr":76,"price":0,"type":"event","stats":{"PAC":84,"SHO":78,"PAS":78,"DRI":80,"DEF":59,"PHY":76},"event":"winter","league":"Английская Премьер-лига","realClub":"Арсенал","basePlayerId":"db_0113"},{"name":"Rio Ngumoha","pos":"LW","age":18,"nation":"Англия / Нигерия","club":"Winter Wunderkind","value":50.0,"id":"evt_013","ovr":76,"price":0,"type":"event","stats":{"PAC":83,"SHO":77,"PAS":78,"DRI":84,"DEF":58,"PHY":75},"event":"winter","league":"Английская Премьер-лига","realClub":"Ливерпуль","basePlayerId":"db_0114"},{"name":"Ibrahim Mbaye","pos":"RW","age":18,"nation":"Сенегал / Франция","club":"Winter Wunderkind","value":50.0,"id":"evt_014","ovr":76,"price":0,"type":"event","stats":{"PAC":83,"SHO":77,"PAS":77,"DRI":84,"DEF":58,"PHY":75},"event":"winter","league":"Английская Премьер-лига","realClub":"Астон Вилла","basePlayerId":"db_0115"},{"name":"Said El Mala","pos":"LW","age":20,"nation":"Германия","club":"Winter Wunderkind","value":50.0,"id":"evt_015","ovr":76,"price":0,"type":"event","stats":{"PAC":81,"SHO":80,"PAS":76,"DRI":82,"DEF":61,"PHY":73},"event":"winter","league":"Немецкая Бундеслига","realClub":"Кёльн","basePlayerId":"db_0116"},{"name":"Bazoumana Touré","pos":"LW","age":20,"nation":"Кот-д'Ивуар","club":"Winter Wunderkind","value":50.0,"id":"evt_016","ovr":76,"price":0,"type":"event","stats":{"PAC":82,"SHO":81,"PAS":77,"DRI":83,"DEF":57,"PHY":74},"event":"winter","league":"Английская Премьер-лига","realClub":"Ньюкасл Юнайтед","basePlayerId":"db_0117"},{"name":"Victor Froholdt","pos":"CM","age":20,"nation":"Дания","club":"Winter Wunderkind","value":50.0,"id":"evt_017","ovr":76,"price":0,"type":"event","stats":{"PAC":76,"SHO":70,"PAS":81,"DRI":79,"DEF":73,"PHY":79},"event":"winter","league":"Португальская Примейра","realClub":"Порту","basePlayerId":"db_0118"},{"name":"Ibrahim Maza","pos":"CAM","age":20,"nation":"Алжир / Германия","club":"Winter Wunderkind","value":50.0,"id":"evt_018","ovr":76,"price":0,"type":"event","stats":{"PAC":77,"SHO":79,"PAS":81,"DRI":82,"DEF":61,"PHY":71},"event":"winter","league":"Немецкая Бундеслига","realClub":"Байер 04 Леверкузен","basePlayerId":"db_0119"},{"name":"Franco Mastantuono","pos":"RW","age":19,"nation":"Аргентина / Италия","club":"Winter Wunderkind","value":45.0,"id":"evt_019","ovr":74,"price":0,"type":"event","stats":{"PAC":79,"SHO":78,"PAS":73,"DRI":80,"DEF":59,"PHY":71},"event":"winter","league":"Итальянская Серия А","realClub":"Фиорентина","basePlayerId":"db_0153"},{"name":"Jorrel Hato","pos":"LB","age":20,"nation":"Нидерланды / Кюрасао","club":"Winter Wunderkind","value":45.0,"id":"evt_020","ovr":74,"price":0,"type":"event","stats":{"PAC":77,"SHO":60,"PAS":73,"DRI":73,"DEF":76,"PHY":76},"event":"winter","league":"Английская Премьер-лига","realClub":"Челси","basePlayerId":"db_0154"},{"name":"Geovany Quenda","pos":"RW","age":19,"nation":"Португалия / Гвинея-Бисау","club":"Winter Wunderkind","value":42.0,"id":"evt_021","ovr":72,"price":0,"type":"event","stats":{"PAC":80,"SHO":74,"PAS":74,"DRI":76,"DEF":55,"PHY":72},"event":"winter","league":"Английская Премьер-лига","realClub":"Челси","basePlayerId":"db_0187"},{"name":"Honest Ahanor","pos":"CB","age":18,"nation":"Италия / Нигерия","club":"Winter Wunderkind","value":40.0,"id":"evt_022","ovr":72,"price":0,"type":"event","stats":{"PAC":67,"SHO":54,"PAS":68,"DRI":64,"DEF":78,"PHY":81},"event":"winter","league":"Английская Премьер-лига","realClub":"Кристал Пэлас","basePlayerId":"db_0189"},{"name":"Charalampos Kostoulas","pos":"ST","age":19,"nation":"Греция","club":"Winter Wunderkind","value":40.0,"id":"evt_023","ovr":72,"price":0,"type":"event","stats":{"PAC":76,"SHO":80,"PAS":69,"DRI":75,"DEF":52,"PHY":76},"event":"winter","league":"Английская Премьер-лига","realClub":"Брайтон энд Хоув Альбион","basePlayerId":"db_0190"},{"name":"Marc Bernal","pos":"CDM","age":19,"nation":"Испания","club":"Winter Wunderkind","value":40.0,"id":"evt_024","ovr":72,"price":0,"type":"event","stats":{"PAC":69,"SHO":61,"PAS":73,"DRI":70,"DEF":77,"PHY":79},"event":"winter","league":"Испанская Ла Лига","realClub":"Барселона","basePlayerId":"db_0191"},{"name":"Josh King","pos":"CAM","age":19,"nation":"Англия","club":"Winter Wunderkind","value":40.0,"id":"evt_025","ovr":72,"price":0,"type":"event","stats":{"PAC":71,"SHO":73,"PAS":80,"DRI":76,"DEF":60,"PHY":65},"event":"winter","league":"Английская Премьер-лига","realClub":"Фулхэм","basePlayerId":"db_0192"},{"name":"Christian Kofane","pos":"ST","age":20,"nation":"Камерун","club":"Winter Wunderkind","value":40.0,"id":"evt_026","ovr":72,"price":0,"type":"event","stats":{"PAC":76,"SHO":80,"PAS":69,"DRI":75,"DEF":52,"PHY":76},"event":"winter","league":"Немецкая Бундеслига","realClub":"Байер 04 Леверкузен","basePlayerId":"db_0193"},{"name":"Endrick","pos":"ST","age":20,"nation":"Бразилия","club":"Winter Wunderkind","value":40.0,"id":"evt_027","ovr":72,"price":0,"type":"event","stats":{"PAC":75,"SHO":79,"PAS":68,"DRI":74,"DEF":56,"PHY":75},"event":"winter","league":"Испанская Ла Лига","realClub":"Реал Мадрид","basePlayerId":"db_0194"},{"name":"Senny Mayulu","pos":"CM","age":20,"nation":"Франция / ДР Конго","club":"Winter Wunderkind","value":40.0,"id":"evt_028","ovr":72,"price":0,"type":"event","stats":{"PAC":70,"SHO":69,"PAS":75,"DRI":73,"DEF":72,"PHY":73},"event":"winter","league":"Французская Лига 1","realClub":"Пари Сен-Жермен","basePlayerId":"db_0195"},{"name":"Lucas Bergvall","pos":"CM","age":20,"nation":"Швеция","club":"Winter Wunderkind","value":40.0,"id":"evt_029","ovr":72,"price":0,"type":"event","stats":{"PAC":71,"SHO":70,"PAS":76,"DRI":74,"DEF":68,"PHY":74},"event":"winter","league":"Английская Премьер-лига","realClub":"Тоттенхэм Хотспур","basePlayerId":"db_0196"},{"name":"Gianluca Prestianni","pos":"RW","age":20,"nation":"Аргентина / Италия","club":"Winter Wunderkind","value":40.0,"id":"evt_030","ovr":72,"price":0,"type":"event","stats":{"PAC":79,"SHO":73,"PAS":73,"DRI":80,"DEF":54,"PHY":71},"event":"winter","league":"Португальская Примейра","realClub":"Бенфика","basePlayerId":"db_0197"},{"name":"Rodrigo Mora","pos":"CAM","age":19,"nation":"Португалия","club":"Winter Wunderkind","value":38.0,"id":"evt_031","ovr":70,"price":0,"type":"event","stats":{"PAC":73,"SHO":70,"PAS":77,"DRI":73,"DEF":57,"PHY":67},"event":"winter","league":"Итальянская Серия А","realClub":"Рома","basePlayerId":"db_0246"},{"name":"Konstantinos Karetsas","pos":"CAM","age":19,"nation":"Греция / Бельгия","club":"Winter Wunderkind","value":35.0,"id":"evt_032","ovr":69,"price":0,"type":"event","stats":{"PAC":69,"SHO":71,"PAS":73,"DRI":74,"DEF":58,"PHY":63},"event":"winter","league":"Немецкая Бундеслига","realClub":"Боруссия Дортмунд","basePlayerId":"db_0249"},{"name":"Ethan Nwaneri","pos":"CAM","age":19,"nation":"Англия / Нигерия","club":"Winter Wunderkind","value":35.0,"id":"evt_033","ovr":69,"price":0,"type":"event","stats":{"PAC":71,"SHO":68,"PAS":75,"DRI":76,"DEF":55,"PHY":65},"event":"winter","league":"Немецкая Бундеслига","realClub":"Боруссия Дортмунд","basePlayerId":"db_0250"},{"name":"Jaydee Canvot","pos":"CB","age":20,"nation":"Франция / Сенегал","club":"Winter Wunderkind","value":35.0,"id":"evt_034","ovr":69,"price":0,"type":"event","stats":{"PAC":65,"SHO":47,"PAS":66,"DRI":62,"DEF":76,"PHY":79},"event":"winter","league":"Английская Премьер-лига","realClub":"Кристал Пэлас","basePlayerId":"db_0251"}];
const fcucNameKey = n => String(n||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9а-я]+/g,' ').trim();
const fcucOwned = name => state.players.some(p=>fcucNameKey(p.name)===fcucNameKey(name));
const fcucId = (prefix='p') => prefix+'_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,8);
const fcucValue = ovr => Math.round((12000*Math.pow(1.115,Number(ovr)-40))/1000)*1000;
const fcucSafeText = s => escapeHTML(String(s??''));
const fcucPosLabel = p => ({GK:'ВР',CB:'ЦЗ',LB:'ЛЗ',RB:'ПЗ',CDM:'ОП',CM:'ЦП',CAM:'АП',LW:'ЛВ',RW:'ПВ',ST:'НАП',LM:'ЛП',RM:'ПП'}[p]||p);
function fcucUniquePool(list){const seen=new Set();return list.filter(p=>{let k=fcucNameKey(p.name);if(seen.has(k))return false;seen.add(k);return true;});}

function fcucCardHTML(p){
 const stats=p.stats||{};
 const keys=p.pos==='GK'?['DIV','HAN','KIC','REF','SPD','POS']:['PAC','SHO','PAS','DRI','DEF','PHY'];
 return `<div class="reveal-card"><strong>${p.ovr}</strong><b>${fcucSafeText(p.name)}</b><span>${fcucSafeText(p.club||'MR Academy')} · ${p.pos}</span><div class="player-attributes">${keys.map(k=>`<span><b>${stats[k]??p.ovr}</b><small>${k}</small></span>`).join('')}</div></div>`;
}

function fcucAddToClub(source, prefix='card'){
  if(!source || fcucOwned(source.name)) return null;
  const p={...source,id:fcucId(prefix),price:0};
  state.players.push(p);
  if(state.bench.length<7) state.bench.push(p.id);
  save(); updateWallet(); drawSquad(); updateOverall(); renderReserve();
  return p;
}
function renderReserve(){
  const box=$('#reserveList'); if(!box)return;
  const used=new Set([...(state.startingXI||[]),...(state.bench||[])]);
  const reserve=state.players.filter(p=>!used.has(p.id));
  box.innerHTML=reserve.map(p=>`<div class="reserve-row"><span><b>${p.ovr}</b> ${fcucSafeText(p.pos)} · ${fcucSafeText(p.name)}</span><span><button class="mini-action" data-promote="${p.id}">В ЗАПАС</button><button class="mini-action sell" data-sell="${p.id}">ПРОДАТЬ</button></span></div>`).join('')||'<p class="muted">Резерв пока пуст. Игроки сверх стартового состава и запаса появятся здесь.</p>';
  const count=$('#rosterCount'); if(count)count.textContent=state.players.length;
  const exchangeStatus=$('#exchangeRosterStatus');if(exchangeStatus)exchangeStatus.textContent=`Игроков в клубе: ${state.players.length}/18`;
  renderExchangeOptions();
}
function renderExchangeOptions(){
  const ids=[...(state.bench||[]),...state.players.filter(p=>!(state.startingXI||[]).includes(p.id)&&!(state.bench||[]).includes(p.id)).map(p=>p.id)];
  const eligible=ids.map(id=>playerById(id)).filter(p=>p && ['ST','LW','RW','CAM'].includes(p.pos) && Number(p.ovr)>=60);
  for(let n=1;n<=3;n++){let el=$('#tradePlayer'+n);if(el){let prev=el.value;el.innerHTML='<option value="">Выбери игрока атаки (60+)</option>'+eligible.map(p=>`<option value="${p.id}">${fcucSafeText(p.name)} · ${p.pos} · ${p.ovr}</option>`).join('');if([...el.options].some(o=>o.value===prev))el.value=prev;}}
  const b=$('#tradeEndrick');if(b){let valid=state.players.length>=18&&!fcucOwned('Endrick')&&eligible.length>=3;b.disabled=!valid;b.textContent=fcucOwned('Endrick')?'ЭНДРИК УЖЕ В КЛУБЕ':state.players.length<18?'НУЖНО 18 ИГРОКОВ': 'ОБМЕНЯТЬ НА ЭНДРИКА';}
}
function renderEventMarket(){
 const box=$('#eventPlayerMarket');if(!box)return;
 const available=FCUC_EVENT_DB.filter(p=>!fcucOwned(p.name));
 box.innerHTML=available.slice(0,34).map(p=>{
  const cost=60+Math.max(0,p.ovr-69)*10;
  return `<article class="market-card event-market-card"><div class="card-art winter-card"><b>${p.ovr}</b><small>${p.pos} · WINTER</small></div><div class="card-info"><b>${fcucSafeText(p.name)}</b><small>${fcucSafeText(p.club)} · ${p.age} лет</small><div class="price-row"><span>❄ ${cost} жетонов</span><button data-event-buy="${p.id}" data-cost="${cost}">ПОЛУЧИТЬ</button></div></div></article>`;
 }).join('')||'<p class="muted">Все доступные карточки события уже собраны.</p>';
}
function renderMarket(){
 const grid=$('#marketGrid');if(!grid)return;
 const selected=$('.filters button.selected')?.dataset.filter||'all';
 const q=($('#marketSearch')?.value||'').trim().toLocaleLowerCase();
 const filters={
  all:()=>true,GK:p=>p.pos==='GK',
  DEF:p=>['CB','LB','RB'].includes(p.pos),
  MID:p=>['CDM','CM','CAM','LM','RM'].includes(p.pos),
  ATT:p=>['ST','LW','RW'].includes(p.pos)
 };
 const data=(state.market||[]).filter(p=>(filters[selected]||filters.all)(p)&&(p.name+' '+p.pos+' '+(p.club||'')).toLocaleLowerCase().includes(q));
 grid.innerHTML=data.map(p=>{
  const owned=fcucOwned(p.name);
  return `<article class="market-card"><div class="card-art ${p.ovr>=89?'gold':p.ovr>=82?'purple':p.ovr<60?'bronze':''}"><b>${p.ovr}</b><small>${fcucPosLabel(p.pos)} · ${p.pos}</small></div><div class="card-info"><b>${fcucSafeText(p.name)}</b><small>${fcucSafeText(p.club||'Свободный агент')} · ${p.age||'—'} лет</small><div class="price-row"><span>● ${fmt(p.price||fcucValue(p.ovr))}</span><button data-buy-v4="${p.id}" ${owned?'disabled':''}>${owned?'УЖЕ В КЛУБЕ':'КУПИТЬ'}</button></div></div></article>`;
 }).join('')||'<p class="muted">Игроки не найдены. Попробуй другой фильтр или запрос.</p>';
 const count=$('#marketCount');if(count)count.textContent=`${data.length} игроков`;
}
function renderEventMode(){
 renderDaily();renderBranch();renderEventMarket();
 const tokens=$('#eventTokenBalance');if(tokens)tokens.textContent=fmt(state.eventTokens||0);
 const gems=$('#eventGemBalance');if(gems)gems.textContent=fmt(state.winterGems||0);
}
function updateWallet(){
 state.eventCoins=Number(state.winterGems||0);
 updateWalletBase();
 if($('#eventGemBalance'))$('#eventGemBalance').textContent=fmt(state.winterGems||0);
 if($('#eventTokenBalance'))$('#eventTokenBalance').textContent=fmt(state.eventTokens||0);if($('#eventGemBalance2'))$('#eventGemBalance2').textContent=fmt(state.winterGems||0);
 if($('#storeGems'))$('#storeGems').textContent=fmt(state.gems||0)+' ◆';
}
function updateOverall(){
 const ids=state.startingXI||[];
 const avg=Math.round(ids.reduce((n,id)=>n+Number(playerById(id).ovr||50),0)/Math.max(1,ids.length));
 if($('#homeOVR'))$('#homeOVR').textContent=avg;
 if($('#homeOVRBar'))$('#homeOVRBar').style.width=avg+'%';
 if($('#squadOVR'))$('#squadOVR').textContent=avg;
}
function selectSquadPlayer(index){
 const current=playerById(state.startingXI[index]);
 const currentNames=new Set(state.startingXI.filter((_,i)=>i!==index).map(id=>fcucNameKey(playerById(id).name)));
 const options=state.bench.map(id=>playerById(id)).filter(p=>!currentNames.has(fcucNameKey(p.name)));
 const html=options.map(p=>`<option value="${p.id}">${fcucSafeText(p.name)} · ${p.pos} · ${p.ovr}</option>`).join('');
 modal('ЗАМЕНА В СОСТАВЕ',`Выбран: ${current.name}. Одинакового футболиста нельзя поставить дважды.`, `<select id="squadSwapSelect" class="modal-select">${html}</select><button class="primary full" id="confirmSquadSwap" ${options.length?'':'disabled'}>ЗАМЕНИТЬ ИГРОКА</button>`);
 $('#confirmSquadSwap')?.addEventListener('click',()=>{
  const id=$('#squadSwapSelect')?.value;if(!id)return;
  const p=playerById(id);if(state.startingXI.some((x,i)=>i!==index&&fcucNameKey(playerById(x).name)===fcucNameKey(p.name))){toast('Этот футболист уже есть в стартовом составе');return;}
  const ix=state.bench.indexOf(id);if(ix<0)return;
  state.bench[ix]=state.startingXI[index];state.startingXI[index]=id;
  save();drawSquad();renderReserve();closeModal();toast('Состав обновлён');
 });
}
function drawSquad(){
 const pitch=$('#pitch');if(!pitch)return;
 pitch.querySelectorAll('.player').forEach(x=>x.remove());
 const pos=positionsFor(state.formation);
 state.startingXI.forEach((id,i)=>{
  const p=playerById(id),xy=pos[i];if(!p||!xy)return;
  const el=document.createElement('button');el.className='player';el.type='button';
  el.style.left=xy[0]+'%';el.style.top=xy[1]+'%';
  el.innerHTML=`<i>${p.ovr}</i><small>${fcucSafeText(p.name.split(' ').slice(-1)[0])}</small>`;
  el.title=p.name+' · '+p.pos+' · '+p.ovr;el.addEventListener('click',()=>selectSquadPlayer(i));pitch.append(el);
 });
 if($('#formationLabel'))$('#formationLabel').textContent=state.formation;
 const bench=$('#benchList');
 if(bench)bench.innerHTML=state.bench.map(id=>{let p=playerById(id);return `<div class="bench-row"><button class="bench-player" data-bench="${id}"><b>${p.ovr}</b> ${fcucSafeText(p.pos)} · ${fcucSafeText(p.name)}</button><button class="mini-action sell" data-sell="${id}">ПРОДАТЬ</button></div>`;}).join('')||'<span>Запасных пока нет</span>';
 if($('#squadOVR'))$('#squadOVR').textContent=Math.round(state.startingXI.reduce((n,id)=>n+playerById(id).ovr,0)/Math.max(1,state.startingXI.length));
 renderReserve();updateOverall();
}
function fcucAddPlayerToPool(p){
 if(!p||fcucOwned(p.name))return false;
 const owned={...p,id:fcucId('owned'),price:0};
 state.players.push(owned);
 if(state.bench.length<7)state.bench.push(owned.id);
 save();updateWallet();drawSquad();return true;
}
function fcucPoisson(lambda){
 let L=Math.exp(-lambda),k=0,prod=1;do{k++;prod*=Math.random();}while(prod>L&&k<12);return Math.min(5,k-1);
}
function playEventMatch(){
 const btn=$('#eventMatchPlay');if(btn)btn.disabled=true;
 const avg=state.startingXI.reduce((n,id)=>n+playerById(id).ovr,0)/Math.max(1,state.startingXI.length);
 const mentality=state.tactics?.mentality||'Баланс';
 let xg=Math.max(.25,Math.min(2.8,1.0+(avg-60)*.025+(mentality==='Атака'?.22:mentality==='Оборона'?-.18:0)));
 let home=fcucPoisson(xg),away=fcucPoisson(1.15);
 const win=home>away,draw=home===away;
 state.eventStats=state.eventStats||{matches:0,wins:0,goals:0};
 state.eventStats.matches++;state.eventStats.goals+=home;
 if(win)state.eventStats.wins++;
 state.eventTokens=(state.eventTokens||0)+20+(win?10:0)+(draw?5:0);
 state.winterGems=(state.winterGems||0)+3+(win?2:0);
 state.eventPoints=(state.eventPoints||0)+40+(win?25:0);
 state.seasonXP=(state.seasonXP||0)+40+(win?25:0);
 addStat('matches');if(home) addStat('goals',home);if(win)addStat('wins');
 state.history.unshift({date:new Date().toLocaleDateString('ru-RU'),score:`${home} — ${away}`,result:win?'Победа события':draw?'Ничья события':'Поражение события',mode:'event'});
 state.history=state.history.slice(0,12);
 save();updateWallet();renderAll();renderEventMode();updateOverall();
 const out=$('#eventMatchResult');if(out)out.innerHTML=`<div class="event-result"><b>${home} — ${away}</b><span>${win?'ПОБЕДА!':draw?'НИЧЬЯ':'МАТЧ ЗАВЕРШЁН'}</span><small>+${20+(win?10:0)+(draw?5:0)} жетонов · +${3+(win?2:0)} зимних самоцветов</small></div>`;
 if(btn){btn.disabled=false;btn.textContent='СЫГРАТЬ МАТЧ СОБЫТИЯ';}
 toast(win?'Победа! Награды события начислены.':'Награды за матч события начислены.');
}
function fcucOpenPack(cost,type){
 if(state.gems<cost){toast('Недостаточно обычных самоцветов');return;}
 const ranges={standard:[40,70],starter:[40,70],gold:[55,82],premium:[55,82],elite:[70,93]};
 const [min,max]=ranges[type]||ranges.standard;
 const candidates=FCUC_PLAYER_DB.filter(p=>p.ovr>=min&&p.ovr<=max&&!fcucOwned(p.name));
 if(!candidates.length){toast('В этом диапазоне больше нет новых игроков');return;}
 const weighted=candidates.filter(p=>p.ovr<=max-4);
 const p=candidates[Math.floor(Math.random()*candidates.length)];
 state.gems-=cost;addStat('packs');
 const added=fcucAddPlayerToPool(p);
 if(!added){toast('Игрок уже есть в клубе — попробуй ещё раз');return;}
 if(typeof fcucV06AddXP==='function')fcucV06AddXP(10,'набор');
 const owned=state.players[state.players.length-1];
 modal('ИГРОК ПОЛУЧЕН!',`${owned.name} · ${owned.pos} · рейтинг ${owned.ovr}. Игрок добавлен в ${state.bench.includes(owned.id)?'запас':'резерв'} клуба.`,fcucCardHTML(owned));
 save();updateWallet();
}
function fcucBuyEventCard(id,cost){
 const p=FCUC_EVENT_DB.find(x=>x.id===id);if(!p)return;
 if(fcucOwned(p.name)){toast('У тебя уже есть этот футболист');renderEventMarket();return;}
 if((state.eventTokens||0)<cost){toast('Не хватает жетонов события');return;}
 state.eventTokens-=cost;
 const ok=fcucAddPlayerToPool(p);
 if(ok){state.stats.buys=(state.stats.buys||0)+1;state.weeklyProgress.buys=(state.weeklyProgress.buys||0)+1;if(typeof fcucV06AddXP==='function')fcucV06AddXP(10,'карточка события');}
 if(!ok){state.eventTokens+=cost;return;}
 save();updateWallet();renderEventMarket();renderAll();
 modal('КАРТОЧКА СОБРАНА',`${p.name} · ${p.ovr} OVR. Специальная зимняя версия добавлена в клуб.`);
}
function fcucTradeEndrick(){toast('Старый обмен перенесён во вкладку «Обмены».');}
function fcucSellPlayer(id){
 if(state.startingXI.includes(id)){toast('Нельзя продавать игрока стартового состава');return;}
 const p=playerById(id);if(!state.players.some(x=>x.id===id))return;
 const price=Math.max(2000,Math.round(fcucValue(p.ovr)*.38/1000)*1000);
 state.players=state.players.filter(x=>x.id!==id);state.bench=state.bench.filter(x=>x!==id);state.reserve=(state.reserve||[]).filter(x=>x!==id);
 state.coins+=price;save();updateWallet();drawSquad();renderMarket();
 modal('ИГРОК ПРОДАН',`${p.name} продан за ${fmt(price)} монет. Цена продажи ниже рыночной стоимости.`);
}
function applyTactics(){
 state.tactics=state.tactics||{mentality:'Баланс',width:'Стандартная',press:'Средний',line:'Средняя',build:'Сбалансированный'};
 const map={tacticMentality:'mentality',tacticWidth:'width',tacticPress:'press',tacticLine:'line',tacticBuild:'build'};
 Object.entries(map).forEach(([id,key])=>{const el=$('#'+id);if(el){el.value=state.tactics[key];if(!el.dataset.bound){el.dataset.bound='1';el.addEventListener('change',()=>{state.tactics[key]=el.value;save();toast('Тактика сохранена');});}}});
}
function fcucTacticGoalModifier(){
 const t=state.tactics||{};
 let mod=0;
 if(t.mentality==='Атака')mod+=.003;
 if(t.mentality==='Оборона')mod-=.003;
 if(t.press==='Высокий')mod+=.0015;
 if(t.width==='Широкая')mod+=.001;
 if(t.width==='Узкая')mod-=.0005;
 if(t.build==='Быстрые атаки')mod+=.001;
 if(t.build==='Контроль мяча')mod-=.0005;
 return mod;
}
function fcucTacticAwayModifier(){
 const t=state.tactics||{};let mod=0;
 if(t.mentality==='Оборона')mod-=.0025;
 if(t.press==='Высокий')mod+=.0015;
 if(t.line==='Высокая')mod+=.002;
 if(t.line==='Низкая')mod-=.001;
 return mod;
}
/* capture handlers prevent old prototype handlers from double-firing */
document.addEventListener('click',e=>{
 const buy=e.target.closest('[data-buy-v4]');if(buy){e.preventDefault();e.stopImmediatePropagation();const p=state.market.find(x=>x.id===buy.dataset.buyV4);if(!p)return;if(fcucOwned(p.name)){toast('Этот игрок уже есть в клубе');return;}if(state.coins<p.price){toast('Недостаточно монет');return;}state.coins-=p.price;const owned={...p,id:fcucId('transfer'),price:0};state.players.push(owned);if(state.bench.length<7)state.bench.push(owned.id);state.stats.buys=(state.stats.buys||0)+1;state.weeklyProgress.buys=(state.weeklyProgress.buys||0)+1;if(typeof fcucV06AddXP==='function')fcucV06AddXP(10,'трансфер');save();updateWallet();drawSquad();renderReserve();renderMarket();renderAll();modal('ТРАНСФЕР ЗАВЕРШЁН',`${p.name} подписан за ${fmt(p.price)} монет и добавлен в клуб.`);return;}
 const eb=e.target.closest('[data-event-buy]');if(eb){e.preventDefault();e.stopImmediatePropagation();fcucBuyEventCard(eb.dataset.eventBuy,+eb.dataset.cost);return;}
 const winterPack=e.target.closest('.winter-pack-buy');if(winterPack){e.preventDefault();e.stopImmediatePropagation();const cost=Number(winterPack.dataset.winterCost||30);if((state.winterGems||0)<cost){toast('Недостаточно зимних самоцветов');return;}const pool=FCUC_EVENT_DB.filter(p=>p.event!=='newyear'&&!fcucOwned(p.name));if(!pool.length){toast('Все карточки зимнего события уже собраны');return;}const weighted=[];for(const x of pool){const w=x.ovr>=80?1:x.ovr>=76?3:x.ovr>=73?7:14;for(let j=0;j<w;j++)weighted.push(x);}const p=weighted[Math.floor(Math.random()*weighted.length)];state.winterGems-=cost;state.eventCoins=state.winterGems;const ok=fcucAddPlayerToPool(p);if(ok){state.stats.packs=(state.stats.packs||0)+1;state.weeklyProgress.packs=(state.weeklyProgress.packs||0)+1;if(typeof fcucV06AddXP==='function')fcucV06AddXP(10,'зимний набор');}if(!ok){state.winterGems+=cost;return;}save();updateWallet();renderAll();renderEventMode();modal('ЗИМНИЙ НАБОР ОТКРЫТ',`${p.name} · ${p.ovr} OVR. Карточка события добавлена в клуб.`,fcucCardHTML(p));return;}
 const pack=e.target.closest('.pack-buy');if(pack){e.preventDefault();e.stopImmediatePropagation();fcucOpenPack(+pack.dataset.cost,pack.dataset.type||'standard');return;}
 const promote=e.target.closest('[data-promote]');if(promote){e.preventDefault();e.stopImmediatePropagation();let id=promote.dataset.promote;if(state.bench.length>=7){toast('Запас заполнен. Освободи место.');return;}state.reserve=(state.reserve||[]).filter(x=>x!==id);state.bench.push(id);drawSquad();renderReserve();save();return;}
 const sell=e.target.closest('[data-sell]');if(sell){e.preventDefault();e.stopImmediatePropagation();fcucSellPlayer(sell.dataset.sell);return;}
 if(e.target.id==='eventMatchPlay'){e.preventDefault();e.stopImmediatePropagation();playEventMatch();return;}
 if(e.target.id==='tradeEndrick'){e.preventDefault();e.stopImmediatePropagation();fcucTradeEndrick();return;}
 if(e.target.id==='claimBranchPlayer'){e.preventDefault();e.stopImmediatePropagation();if(!branchDefs.every(q=>(state.branchProgress[q.stat]||0)>=q.goal)){toast('Сначала выполни все этапы ветки');return;}if(state.branchClaimed){toast('Награда уже получена');return;}state.branchClaimed=true;state.eventTokens=(Number(state.eventTokens)||0)+120;save();renderBranch();updateWallet();modal('ВЕТКА СОБЫТИЯ ЗАВЕРШЕНА','Получено 120 жетонов события. Игроков можно получить через отдельные обмены.');return;}
},true);
$$('.filters button').forEach(b=>{if(!b.dataset.v4){b.dataset.v4='1';b.addEventListener('click',()=>{ $$('.filters button').forEach(x=>x.classList.toggle('selected',x===b));renderMarket();});}});
$('#marketSearch')?.addEventListener('input',renderMarket);
['#tradePlayer1','#tradePlayer2','#tradePlayer3'].forEach(sel=>$(sel)?.addEventListener('change',renderExchangeOptions));
/* state migration and player database injection */
state.gems=Number(state.gems??10);
state.winterGems=Number(state.winterGems??state.eventCoins??0);
state.eventCoins=state.winterGems;
state.eventTokens=Number(state.eventTokens||0);
state.tactics=state.tactics||{mentality:'Баланс',width:'Стандартная',press:'Средний',line:'Средняя',build:'Сбалансированный'};
state.eventStats=state.eventStats||{matches:0,wins:0,goals:0};
const fcucLegacyDuplicateNames=new Set(['Ламин Ямаль','Джуд Беллингем','Эрлинг Холанд','Педри','Вильям Салиба','Джанлуиджи Доннарумма','Флориан Вирц','Букаё Сака','Деклан Райс','Винисиус Жуниор','Хулиан Альварес'].map(fcucNameKey));
const fcucCustomMarket=(state.market||[]).filter(p=>!FCUC_PLAYER_DB.some(x=>fcucNameKey(x.name)===fcucNameKey(p.name))&&!fcucLegacyDuplicateNames.has(fcucNameKey(p.name)));
state.market=fcucUniquePool([...FCUC_PLAYER_DB,...fcucCustomMarket]).map(p=>({...p,price:p.price||fcucValue(p.ovr)}));
/* ensure old market seed duplicates don't shadow imported DB records */
const fcucMarketByName=new Map();state.market.forEach(p=>{const k=fcucNameKey(p.name);if(!fcucMarketByName.has(k)||String(p.id).startsWith('db_'))fcucMarketByName.set(k,p);});
state.market=[...fcucMarketByName.values()];
state.reserve=state.reserve||[];
function renderAllV4(){renderAllV3();renderEventMode();renderReserve();updateOverall();}
const renderAllV3Base=renderAll;renderAll=renderAllV4;
const renderMatchTickBase=matchTick;
matchTick=function(){
 if(!match.active)return;
 match.minute++;
 const avg=state.startingXI.reduce((n,id)=>n+playerById(id).ovr,0)/Math.max(1,state.startingXI.length);
 let mod=fcucTacticGoalModifier();if(match.style==='Атака')mod+=.003;else if(match.style==='Оборона')mod-=.003;
 const strength=Math.max(.78,Math.min(1.24,.94+(avg-60)*.006));
 const homeChance=Math.max(.006,Math.min(.032,(.014+mod)*strength));
 const awayChance=Math.max(.006,Math.min(.03,.0145+fcucTacticAwayModifier()));
 if(match.home<5&&Math.random()<homeChance){match.home++;addStat('goals');matchLog('ГОЛ! '+(state.club?.name||'Клуб')+' забивает!');state.seasonXP+=10;state.eventPoints+=10;state.weeklyProgress.eventPoints+=10;}
 else if(match.away<5&&Math.random()<awayChance){match.away++;matchLog('Соперник забивает гол.');}
 else if(match.minute%7===0)matchLog(['Опасная атака хозяев','Удар — вратарь спасает','Подача с фланга','Перехват в центре поля','Стандарт у ворот соперника'][Math.floor(Math.random()*5)]);
 renderMatchSetup();if($('#matchTimeline'))$('#matchTimeline').style.width=(match.minute/90*100)+'%';
 if(match.minute>=90)finishMatch();save();
};
function applyTacticUI(){
 const panel=$('#tacticsPanel');if(!panel)return;
 applyTactics();
}
function navigateV4(page){navigateBase(page);if(page==='settings')applyClub();if(page==='event')renderEventMode();if(page==='squad'){drawSquad();applyTacticUI();}if(page==='market')renderMarket();}
const navigateV3=navigate;navigate=function(page){navigateV4(page);};
document.addEventListener('DOMContentLoaded',()=>{});
drawSquad=function(){const pitch=$('#pitch');if(!pitch)return;pitch.querySelectorAll('.player').forEach(x=>x.remove());const pos=positionsFor(state.formation);state.startingXI.forEach((id,i)=>{const p=playerById(id),xy=pos[i];if(!p||!xy)return;const el=document.createElement('button');el.className='player';el.type='button';el.style.left=xy[0]+'%';el.style.top=xy[1]+'%';el.innerHTML=`<i>${p.ovr}</i><small>${fcucSafeText(p.name.split(' ').slice(-1)[0])}</small>`;el.title=p.name+' · '+p.pos+' · '+p.ovr;el.addEventListener('click',()=>selectSquadPlayer(i));pitch.append(el);});if($('#formationLabel'))$('#formationLabel').textContent=state.formation;const bench=$('#benchList');if(bench)bench.innerHTML=state.bench.map(id=>{const p=playerById(id);return `<div class="bench-row"><button class="bench-player" data-bench="${id}"><b>${p.ovr}</b> ${fcucSafeText(p.pos)} · ${fcucSafeText(p.name)}</button><button class="mini-action sell" data-sell="${id}">ПРОДАТЬ</button></div>`;}).join('')||'<span>Запасных пока нет</span>';renderReserve();updateOverall();};
updateWallet=function(){state.eventCoins=Number(state.winterGems||0);updateWalletBase();if($('#eventGemBalance'))$('#eventGemBalance').textContent=fmt(state.winterGems||0);if($('#eventGemBalance2'))$('#eventGemBalance2').textContent=fmt(state.winterGems||0);if($('#eventTokenBalance'))$('#eventTokenBalance').textContent=fmt(state.eventTokens||0);if($('#storeGems'))$('#storeGems').textContent=fmt(state.gems||0)+' ◆';};
$$('.styles button').forEach(b=>{if(!b.dataset.tacticV4){b.dataset.tacticV4='1';b.addEventListener('click',()=>{state.tactics.mentality=b.textContent.trim();const el=$('#tacticMentality');if(el)el.value=state.tactics.mentality;save();});}});
applyClub();applyTacticUI();renderAll();renderMarket();renderEventMode();drawSquad();updateWallet();updateOverall();save();


/* ================= FCUC v0.6 RESTORE + FIX PACK =================
 * Keeps the complete v0.4 feature set (live match, tactics, event branch,
 * event market, exchange, reserve, snowfall) and layers stable progression
 * and v0.5 save recovery on top. */
const FCUC_V06_XP_PER_LEVEL = 500;
const FCUC_V06_OLD_SAVE_KEY = 'fcuc_winter_save_v5';

function fcucV06MigrateSave(){
  let raw5=null;
  try{raw5=localStorage.getItem(FCUC_V06_OLD_SAVE_KEY);}catch(e){}
  if(raw5){
    try{
      const parsed=JSON.parse(raw5), old=parsed.state||parsed;
      if(old && Array.isArray(old.players)){
        state.players=old.players.map(p=>({...p}));
        state.startingXI=Array.isArray(old.startingXI)?old.startingXI.slice():[];
        state.bench=Array.isArray(old.bench)?old.bench.slice():[];
        state.reserve=Array.isArray(old.reserve)?old.reserve.slice():[];
        state.coins=Number(old.coins??30000);state.gems=Number(old.gems??10);
        state.winterGems=Number(old.winterGems??0);state.eventCoins=state.winterGems;
        state.eventTokens=Number(old.eventTokens??0);
        state.club={...(state.club||{}),...(old.club||{})};
        state.tactics={...(state.tactics||{}),...(old.tactics||{})};
        state.style=state.tactics.mentality||old.style||'Баланс';
        state.formation=old.formation||state.formation||'4-3-3';
        state.seasonXP=Number(old.xp??old.seasonXP??0);
        state.clubLevel=1+Math.floor(state.seasonXP/FCUC_V06_XP_PER_LEVEL);
        state.stats={...(state.stats||{}),...(old.stats||{})};
        state.history=Array.isArray(old.history)?old.history.slice(0,30):[];
        state.dailyDate=old.dailyDate||todayKey();
        state.dailyProgress={matches:0,goals:0,wins:0,...(old.dailyProgress||{})};
        state.dailyClaimed=Array.isArray(old.dailyClaimed)?old.dailyClaimed.slice():[];
        state.weeklyProgress={matches:0,goals:0,wins:0,packs:0,buys:0,eventPoints:0,...(old.weeklyProgress||{})};
        state.weeklyClaimed=Array.isArray(old.weeklyClaimed)?old.weeklyClaimed.slice():[];
        state.eventTokens=Number(old.eventTokens||0);
        state.passV06Claimed=Array.isArray(old.passClaimed)?old.passClaimed.slice():[];
        state.questFixVersion=0;
      }
    }catch(e){console.warn('v0.5 save migration skipped',e);}
  }
  // Guarantee a full 16-player starting club even when a previous build saved
  // an empty bench/reserve. Restore only missing starter identities.
  state.players=Array.isArray(state.players)?state.players:[];
  state.startingXI=Array.isArray(state.startingXI)?state.startingXI:[];
  state.bench=Array.isArray(state.bench)?state.bench:[];
  state.reserve=Array.isArray(state.reserve)?state.reserve:[];
  for(const starter of defaultPlayers){
    let found=state.players.find(p=>fcucNameKey(p.name)===fcucNameKey(starter.name));
    if(!found){let id=starter.id;if(state.players.some(p=>p.id===id))id=fcucId('starter');found={...starter,id};state.players.push(found);}
  }
  const valid=new Set(state.players.map(p=>p.id));
  state.startingXI=state.startingXI.filter(id=>valid.has(id));
  state.bench=state.bench.filter(id=>valid.has(id)&&!state.startingXI.includes(id));
  state.reserve=state.reserve.filter(id=>valid.has(id)&&!state.startingXI.includes(id)&&!state.bench.includes(id));
  if(state.startingXI.length<11){
    for(const starter of defaultPlayers){if(state.startingXI.length>=11)break;const p=state.players.find(x=>fcucNameKey(x.name)===fcucNameKey(starter.name));if(p&&!state.startingXI.includes(p.id)&&!state.bench.includes(p.id))state.startingXI.push(p.id);}
  }
  // At least five original substitutes are always present after migration.
  for(const starter of defaultPlayers.slice(11)){
    const p=state.players.find(x=>fcucNameKey(x.name)===fcucNameKey(starter.name));
    if(p&&!state.startingXI.includes(p.id)&&!state.bench.includes(p.id)&&state.bench.length<7)state.bench.push(p.id);
  }
  // Fill any remaining empty bench slots from the club pool, then leave the rest in reserve.
  for(const p of state.players){if(state.bench.length>=5)break;if(!state.startingXI.includes(p.id)&&!state.bench.includes(p.id))state.bench.push(p.id);}
  // Add a small MR Academy development group to the reserve so the club
  // starts with both substitutes and reserve players, not an empty panel.
  const academyReserve=FCUC_PLAYER_DB.filter(p=>p.club==='MR Academy'&&Number(p.ovr)<=42&&!fcucOwned(p.name)).slice(0,5);
  for(const p of academyReserve)state.players.push({...p,id:fcucId('academy'),price:0});
  state.reserve=state.players.filter(p=>!state.startingXI.includes(p.id)&&!state.bench.includes(p.id)).map(p=>p.id);
  state.coins=Number(state.coins??30000);state.gems=Number(state.gems??10);
  if(!FCUC_HAD_PREVIOUS_SAVE&&!raw5){state.coins=30000;state.gems=10;}
  state.winterGems=Number(state.winterGems??state.eventCoins??0);state.eventCoins=state.winterGems;
  state.eventTokens=Number(state.eventTokens||0);
  state.seasonXP=Number(state.seasonXP??0);
  state.clubLevel=1+Math.floor(state.seasonXP/FCUC_V06_XP_PER_LEVEL);
  state.passV06Claimed=Array.isArray(state.passV06Claimed)?state.passV06Claimed:[];
  state.theme=state.theme==='cozy'?'cozy':'classic';
  state.club=state.club||{name:'FROST UNITED',short:'FU',color:'#64c9f2',accent:'#f0ce85'};
  state.tactics=state.tactics||{mentality:'Баланс',width:'Стандартная',press:'Средний',line:'Средняя',build:'Сбалансированный'};
  // The previous quest build could carry stale progress into a new set of goals.
  if(state.questFixVersion!==1){
    state.dailyDate=todayKey();state.dailyProgress={matches:0,goals:0,wins:0};state.dailyClaimed=[];
    state.weeklyProgress={matches:0,goals:0,wins:0,packs:0,buys:0,eventPoints:0};state.weeklyClaimed=[];
    state.eventProgress={matches:0,goals:0,wins:0};state.eventClaimed=[];
    state.questFixVersion=1;
  }
  // Rebuild market from the embedded database, never requiring a JSON import.
  const custom=(state.market||[]).filter(p=>!FCUC_PLAYER_DB.some(d=>fcucNameKey(d.name)===fcucNameKey(p.name)));
  state.market=fcucUniquePool([...FCUC_PLAYER_DB.filter(p=>!fcucOwned(p.name)),...custom]).map(p=>({...p,price:p.price||fcucValue(p.ovr)}));
  save();
}

function fcucV06SyncProgress(){
  state.clubLevel=1+Math.floor((Number(state.seasonXP)||0)/FCUC_V06_XP_PER_LEVEL);
  const within=(Number(state.seasonXP)||0)%FCUC_V06_XP_PER_LEVEL;
  const set=(id,value)=>{const el=$('#'+id);if(el)el.textContent=value;};
  set('clubLevel',state.clubLevel);set('clubLevelHome',state.clubLevel);
  set('passPoints',fmt(state.seasonXP));set('seasonXPText',`${fmt(within)} / ${FCUC_V06_XP_PER_LEVEL} XP`);
  const bar=$('#seasonXPBar');if(bar)bar.style.width=(within/FCUC_V06_XP_PER_LEVEL*100)+'%';
  const passBar=$('#passProgress');if(passBar)passBar.style.width=(within/FCUC_V06_XP_PER_LEVEL*100)+'%';
}
function fcucV06AddXP(amount,reason){state.seasonXP=Math.max(0,Number(state.seasonXP)||0)+Math.max(0,Math.round(amount));fcucV06SyncProgress();if(reason)toast(`+${amount} XP · ${reason}`);save();}

const FCUC_V06_PASS_REWARDS=[
 ['Монеты','coins',5000],['Жетоны события','tokens',25],['Самоцветы','gems',10],['Монеты','coins',8000],['Зимняя карточка','player',1],
 ['Самоцветы','gems',15],['Монеты','coins',10000],['Жетоны события','tokens',35],['Самоцветы','gems',20],['Зимняя карточка','player',1],
 ['Монеты','coins',12000],['Зимние самоцветы','winter',5],['Самоцветы','gems',20],['Монеты','coins',15000],['Зимняя карточка','player',1],
 ['Жетоны события','tokens',50],['Монеты','coins',18000],['Самоцветы','gems',25],['Монеты','coins',20000],['Зимняя карточка','player',1],
 ['Зимние самоцветы','winter',10],['Монеты','coins',25000],['Самоцветы','gems',30],['Жетоны события','tokens',70],['Зимняя карточка','player',1],
 ['Монеты','coins',30000],['Зимние самоцветы','winter',15],['Самоцветы','gems',40],['Жетоны события','tokens',100],['Особая зимняя карточка','player',1]
];
function renderPassV06(){
 const el=$('#passRewards');if(!el)return;
 const total=Number(state.seasonXP)||0,level=1+Math.floor(total/FCUC_V06_XP_PER_LEVEL),within=total%FCUC_V06_XP_PER_LEVEL;
 const heading=document.querySelector('#pass .week-banner .week-progress b');if(heading)heading.textContent=`ПРОГРЕСС УРОВНЯ ${level}: ${fmt(within)} / ${FCUC_V06_XP_PER_LEVEL} XP`;
 const p=$('#passPoints');if(p)p.textContent=fmt(total);
 el.innerHTML=FCUC_V06_PASS_REWARDS.map((r,i)=>{
   const lv=i+1,need=lv*FCUC_V06_XP_PER_LEVEL,claimed=state.passV06Claimed.includes(lv),ready=total>=need;
   return `<article class="pass-reward ${claimed?'done':ready?'current':''}"><small>УРОВЕНЬ ${lv} · ${fmt(need)} XP</small><b>${r[0]}</b><span>${r[1]==='player'?'❄ Особая карточка':r[1]==='coins'?`● ${fmt(r[2])}`:r[1]==='tokens'?`✧ ${r[2]} жетонов`:r[1]==='winter'?`❄ ${r[2]} зимних`: `◆ ${r[2]}`}</span><button class="claim" data-pass-v06="${lv}" ${claimed||!ready?'disabled':''}>${claimed?'ПОЛУЧЕНО':ready?'ЗАБРАТЬ':'ЗАКРЫТО'}</button></article>`;
 }).join('');
 fcucV06SyncProgress();
}
function claimPassV06(level){
 const r=FCUC_V06_PASS_REWARDS[level-1],need=level*FCUC_V06_XP_PER_LEVEL;
 if(!r||state.passV06Claimed.includes(level)||(Number(state.seasonXP)||0)<need)return;
 state.passV06Claimed.push(level);
 if(r[1]==='coins')state.coins+=r[2];
 else if(r[1]==='gems')state.gems+=r[2];
 else if(r[1]==='winter')state.winterGems+=r[2];
 else if(r[1]==='tokens')state.eventTokens+=r[2];
 else {const pool=FCUC_EVENT_DB.filter(p=>!fcucOwned(p.name));if(pool.length){const preferred=level===30?pool.find(p=>fcucNameKey(p.name)==='endrick'):null;const p=preferred||pool[Math.floor(Math.random()*pool.length)];fcucAddToClub(p,'pass');}else state.eventTokens+=50;}
 save();updateWallet();drawSquad();renderReserve();renderPassV06();modal('НАГРАДА ПАССА',`Уровень ${level}: ${r[0]} получено.`);
}
document.addEventListener('click',e=>{const b=e.target.closest('[data-pass-v06]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();claimPassV06(Number(b.dataset.passV06));},true);
renderPass=renderPassV06;

// Quest claims are guarded by real progress values; no automatic completion/claiming.
document.addEventListener('click',e=>{
 const b=e.target.closest('[data-daily]');if(!b)return;
 e.preventDefault();e.stopImmediatePropagation();
 const i=Number(b.dataset.daily),q=dailyDefs[i];
 if(!q||state.dailyClaimed.includes(i)||(Number(state.dailyProgress[q.stat])||0)<q.goal){toast('Сначала выполни условие ежедневного задания');return;}
 state.dailyClaimed.push(i);state.winterGems=(Number(state.winterGems)||0)+q.reward;state.eventCoins=state.winterGems;
 state.eventPoints=(Number(state.eventPoints)||0)+q.reward*5;fcucV06AddXP(q.reward*5,'ежедневное задание');
 save();updateWallet();renderAll();renderEventMode();renderPassV06();toast(`Получено ${q.reward} зимних самоцветов`);
},true);

document.addEventListener('click',e=>{
 const b=e.target.closest('[data-claim]');if(!b)return;
 e.preventDefault();e.stopImmediatePropagation();
 const i=Number(b.dataset.claim),ev=b.dataset.event==='true';
 const defs=ev?eventDefs:weeklyDefs,claimed=ev?state.eventClaimed:state.weeklyClaimed,progress=ev?state.eventProgress:state.weeklyProgress,q=defs[i];
 if(!q||claimed.includes(i)||(Number(progress[q.stat])||0)<q.goal){toast('Сначала выполни условие задания');return;}
 claimed.push(i);
 if(ev){state.winterGems+=q.reward;state.eventCoins=state.winterGems;state.eventPoints=(state.eventPoints||0)+q.reward;fcucV06AddXP(35,'задание события');}
 else {Object.entries(q.reward||{}).forEach(([k,v])=>{if(k==='eventCoins')state.winterGems+=v;else state[k]=(Number(state[k])||0)+v;});fcucV06AddXP(50,'недельное задание');}
 save();updateWallet();renderAll();renderEventMode();renderPassV06();toast('Задание выполнено. Награда получена!');
},true);

// Only event matches advance event-only quests. Normal matches still advance
// daily/weekly club goals and earn coins, not winter currency.
const fcucV06AddStatBase=addStat;
addStat=function(key,n=1){
 const oldEvent={...(state.eventProgress||{})};
 fcucV06AddStatBase(key,n);
 if(match && match.mode!=='event'){state.eventProgress=oldEvent;save();renderEventMode();}
};
const fcucV06MatchTickBase=matchTick;
matchTick=function(){
 const oldPoints=Number(state.eventPoints)||0,oldWeekly=Number(state.weeklyProgress?.eventPoints)||0;
 fcucV06MatchTickBase();
 if(match && match.mode!=='event'){
   state.eventPoints=oldPoints;
   if(state.weeklyProgress)state.weeklyProgress.eventPoints=oldWeekly;
 }
 fcucV06SyncProgress();
};
const fcucV06FinishMatchBase=finishMatch;
finishMatch=function(){
 if(!match.active)return;
 const isEvent=match.mode==='event',coinsBefore=Number(state.coins)||0,epBefore={...(state.eventProgress||{})},pointsBefore=Number(state.eventPoints)||0,weeklyEventBefore=Number(state.weeklyProgress?.eventPoints)||0;
 const home=match.home,away=match.away,won=home>away,draw=home===away;
 fcucV06FinishMatchBase();
 // Replace legacy oversized rewards with the requested normal match economy.
 state.coins=coinsBefore+(isEvent?0:(won?6500:3500));
 if(!isEvent){state.eventProgress=epBefore;state.eventPoints=pointsBefore;if(state.weeklyProgress)state.weeklyProgress.eventPoints=weeklyEventBefore;}
 else {
   state.eventStats=state.eventStats||{matches:0,wins:0,goals:0};
   state.eventStats.matches++;state.eventStats.goals+=home;if(won)state.eventStats.wins++;
   state.eventTokens=(Number(state.eventTokens)||0)+20+(won?10:draw?5:0);
   state.winterGems=(Number(state.winterGems)||0)+3+(won?2:0);
   state.eventPoints=(Number(state.eventPoints)||0)+40+(won?25:0);
   if(state.weeklyProgress)state.weeklyProgress.eventPoints=(Number(state.weeklyProgress.eventPoints)||0)+40+(won?25:0);
   state.seasonXP=(Number(state.seasonXP)||0)+35;
   const out=$('#eventMatchResult');if(out)out.innerHTML=`<div class="event-result"><b>${home} — ${away}</b><span>${won?'ПОБЕДА!':draw?'НИЧЬЯ':'МАТЧ ЗАВЕРШЁН'}</span><small>+${20+(won?10:draw?5:0)} жетонов · +${3+(won?2:0)} зимних самоцветов</small></div>`;
 }
 state.clubLevel=1+Math.floor((Number(state.seasonXP)||0)/FCUC_V06_XP_PER_LEVEL);
 save();updateWallet();renderAll();renderEventMode();renderPassV06();drawSquad();renderReserve();fcucV06SyncProgress();
 modal(isEvent?'ЗИМНИЙ МАТЧ ЗАВЕРШЁН':won?'ПОБЕДА!':'МАТЧ ЗАВЕРШЁН',isEvent?`Зимняя лига: ${home} — ${away}. Начислены жетоны и зимние самоцветы.`:`${state.club?.name||'Frost United'} ${home} — ${away} Thunder FC. Награда: ${fmt(won?6500:3500)} монет.`);
 if(isEvent){const btn=$('#eventMatchPlay');if(btn){btn.disabled=false;btn.textContent='НАЧАТЬ ЗИМНИЙ МАТЧ · 90 МИНУТ';}}
};
// Event mode now uses the same visible 90-minute engine as league matches.
playEventMatch=function(){
 if(match.active){toast('Матч уже идёт');return;}
 navigate('match');startMatch();match.mode='event';
 const score=$('#score');if(score)score.textContent='WINTER WUNDERKIND · LIVE';
 const log=$('#matchLog');if(log)log.innerHTML='<div>Зимняя лига началась. Удачи!</div>';
 const btn=$('#eventMatchPlay');if(btn){btn.disabled=true;btn.textContent='ЗИМЕННЫЙ МАТЧ ИДЁТ…';}
};
// Keep club level and pass XP consistent whenever the legacy engine awards XP.
const fcucV06RenderAllBase=renderAll;
renderAll=function(){fcucV06RenderAllBase();fcucV06SyncProgress();renderPassV06();};
// Restore theme selector and apply the cozy alternative without removing snowfall.
function applyThemeV06(){document.body.dataset.theme=state.theme==='cozy'?'cozy':'classic';const el=$('#themeSelect');if(el)el.value=document.body.dataset.theme;}
$('#themeSelect')?.addEventListener('change',e=>{state.theme=e.target.value==='cozy'?'cozy':'classic';applyThemeV06();save();});
const fcucV06ApplyClubBase=applyClub;
applyClub=function(){fcucV06ApplyClubBase();applyThemeV06();};

// Migrate and repair roster before the final first paint.
fcucV06MigrateSave();
if($('#formation'))$('#formation').value=state.formation;if($('#matchFormation'))$('#matchFormation').value=state.formation;if($('#matchStyle'))$('#matchStyle').value=state.style;
applyClub();applyTacticUI();drawSquad();renderMarket();renderEventMode();renderAll();renderPassV06();updateWallet();updateOverall();fcucV06SyncProgress();applyThemeV06();save();


/* ================= FC ULTIMATE CLUB v0.7 PATCH =================
   Mobile-safe match controls, protected roster/reserves, timed quests,
   balanced event economy, club audio, market sorting and tactical OVR.
*/
(function(){
'use strict';

// --- Date helpers and 3-day / weekly quest cycles ---
const fcucV07DateKey=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};
const fcucV07DayNumber=(key)=>{const [y,m,d]=key.split('-').map(Number);return Math.floor(Date.UTC(y,m-1,d)/86400000);};
const fcucV07Monday=()=>{const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()-((d.getDay()+6)%7));return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};
const fcucV07QuestSets=[
 [
  {title:'Сыграй 3 матча',desc:'Заверши любые три матча',stat:'matches',goal:3,reward:3},
  {title:'Забей 4 гола',desc:'Забей четыре мяча',stat:'goals',goal:4,reward:4},
  {title:'Одержи 2 победы',desc:'Выиграй два матча',stat:'wins',goal:2,reward:5}
 ],
 [
  {title:'Сыграй 4 матча',desc:'Заверши четыре матча',stat:'matches',goal:4,reward:4},
  {title:'Забей 5 голов',desc:'Забей пять мячей',stat:'goals',goal:5,reward:5},
  {title:'Одержи 3 победы',desc:'Выиграй три матча',stat:'wins',goal:3,reward:6}
 ],
 [
  {title:'Сыграй 2 матча',desc:'Заверши два матча',stat:'matches',goal:2,reward:3},
  {title:'Забей 3 гола',desc:'Забей три мяча',stat:'goals',goal:3,reward:4},
  {title:'Одержи 1 победу',desc:'Выиграй один матч',stat:'wins',goal:1,reward:3}
 ],
 [
  {title:'Сыграй 5 матчей',desc:'Заверши пять матчей',stat:'matches',goal:5,reward:5},
  {title:'Забей 6 голов',desc:'Забей шесть мячей',stat:'goals',goal:6,reward:6},
  {title:'Одержи 3 победы',desc:'Выиграй три матча',stat:'wins',goal:3,reward:6}
 ]
];
function fcucV07RefreshCycles(){
 const today=fcucV07DateKey();
 if(!state.quest3DayAnchor)state.quest3DayAnchor=today;
 let elapsed=fcucV07DayNumber(today)-fcucV07DayNumber(state.quest3DayAnchor);
 if(elapsed>=3){const jumps=Math.floor(elapsed/3);const [y,m,d]=state.quest3DayAnchor.split('-').map(Number);const n=new Date(Date.UTC(y,m-1,d+jumps*3));state.quest3DayAnchor=`${n.getUTCFullYear()}-${String(n.getUTCMonth()+1).padStart(2,'0')}-${String(n.getUTCDate()).padStart(2,'0')}`;state.dailyProgress={matches:0,goals:0,wins:0};state.dailyClaimed=[];state.eventProgress={matches:0,goals:0,wins:0};state.eventClaimed=[];}
 const monday=fcucV07Monday();
 if(state.weekStart!==monday){state.weekStart=monday;state.weeklyProgress={matches:0,goals:0,packs:0,wins:0,buys:0,eventPoints:0};state.weeklyClaimed=[];state.branchProgress={matches:0,goals:0,wins:0,packs:0};state.branchClaimed=false;}
 if(state.eventMatchDate!==today){state.eventMatchDate=today;state.eventMatchesToday=0;}
 if(!state.branchProgress)state.branchProgress={matches:0,goals:0,wins:0,packs:0};
 if(!state.dailyProgress)state.dailyProgress={matches:0,goals:0,wins:0};
 if(!Array.isArray(state.dailyClaimed))state.dailyClaimed=[];
 if(!Array.isArray(state.eventClaimed))state.eventClaimed=[];
 if(!Array.isArray(state.weeklyClaimed))state.weeklyClaimed=[];
}
fcucV07RefreshCycles();
function fcucV07ActiveDailyDefs(){const n=fcucV07DayNumber(state.quest3DayAnchor||fcucV07DateKey());return fcucV07QuestSets[Math.floor(n/3)%fcucV07QuestSets.length];}
function fcucV07UpdateCountdowns(){const now=new Date();const next3=new Date(state.quest3DayAnchor+'T00:00:00');next3.setDate(next3.getDate()+3);let ms=Math.max(0,next3-now);const d=Math.floor(ms/86400000),h=Math.floor(ms%86400000/3600000),m=Math.floor(ms%3600000/60000);const q=$('#questCycleResetLabel');if(q)q.textContent=`Следующее обновление через ${d} дн. ${h} ч. ${m} мин.`;const monday=new Date();monday.setHours(0,0,0,0);monday.setDate(monday.getDate()+((8-monday.getDay())%7||7));ms=Math.max(0,monday-now);const wd=Math.floor(ms/86400000),wh=Math.floor(ms%86400000/3600000),wm=Math.floor(ms%3600000/60000);const w=$('#weeklyResetLabel');if(w)w.textContent=`${wd}д ${wh}ч ${wm}м`; }
renderDaily=function(){
 fcucV07RefreshCycles();const el=$('#dailyQuests');if(!el)return;const defs=fcucV07ActiveDailyDefs();
 el.innerHTML=defs.map((q,i)=>{const v=Number(state.dailyProgress[q.stat])||0,done=v>=q.goal,got=state.dailyClaimed.includes(i);return `<article class="quest"><div class="quest-icon">❄</div><div class="quest-info"><b>${q.title}</b><small>${q.desc} · ${Math.min(v,q.goal)}/${q.goal} · ${got?'Награда получена':done?'Можно забрать':'В процессе'}</small><div class="bar"><i style="width:${Math.min(100,v/q.goal*100)}%"></i></div></div><div class="quest-reward">❄ +${q.reward} зим. самоцветов</div><button class="claim" data-daily-v07="${i}" ${!done||got?'disabled':''}>${got?'ПОЛУЧЕНО':done?'ЗАБРАТЬ':'В ПРОЦЕССЕ'}</button></article>`;}).join('');
 const now=new Date(),end=new Date(now);const anchor=state.quest3DayAnchor.split('-').map(Number);const a=new Date(anchor[0],anchor[1]-1,anchor[2]);a.setDate(a.getDate()+3);end.setTime(a.getTime());let ms=Math.max(0,end-now);const h=Math.floor(ms/3600000),m=Math.floor(ms%3600000/60000);const label=$('#dailyResetLabel');if(label)label.textContent=`НОВЫЕ ЗАДАНИЯ ЧЕРЕЗ ${h}Ч ${m}М`;
};
// Claim new 3-day tasks only after actual progress.
document.addEventListener('click',e=>{const b=e.target.closest('[data-daily-v07]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();fcucV07RefreshCycles();const i=Number(b.dataset.dailyV07),q=fcucV07ActiveDailyDefs()[i];if(!q||state.dailyClaimed.includes(i)||(Number(state.dailyProgress[q.stat])||0)<q.goal){toast('Сначала выполни условие задания');return;}state.dailyClaimed.push(i);state.winterGems=(Number(state.winterGems)||0)+q.reward;state.eventCoins=state.winterGems;state.eventPoints=(Number(state.eventPoints)||0)+q.reward*4;fcucV06AddXP?.(15,'трёхдневное задание');save();updateWallet();renderDaily();toast(`Получено ${q.reward} зимних самоцветов`);},true);

// Weekly branch now really refreshes each Monday, with its own countdown.
const fcucV07RenderBranchBase=renderBranch;
renderBranch=function(){fcucV07RefreshCycles();fcucV07RenderBranchBase();const head=$('#eventBranch .branch-intro');if(head){const monday=fcucV07Monday().split('-').map(Number),end=new Date(monday[0],monday[1]-1,monday[2]+7),ms=Math.max(0,end-new Date()),days=Math.floor(ms/86400000),hours=Math.floor(ms%86400000/3600000);const p=head.querySelector('p');if(p)p.textContent=`Прогресс сохраняется. Новая недельная ветка через ${days} дн. ${hours} ч.`;}};
const fcucV07AddStatBase=addStat;
addStat=function(key,n=1){fcucV07RefreshCycles();fcucV07AddStatBase(key,n);};

// Lower event currency income from both matches and pass rewards.
if(typeof FCUC_V06_PASS_REWARDS!=='undefined'){
 const tokenRewards={1:5,7:8,15:12,23:15,27:18,28:20};
 Object.entries(tokenRewards).forEach(([i,v])=>{if(FCUC_V06_PASS_REWARDS[Number(i)]&&FCUC_V06_PASS_REWARDS[Number(i)][1]==='tokens')FCUC_V06_PASS_REWARDS[Number(i)][2]=v;});
}
if(weeklyDefs[2]?.reward)weeklyDefs[2].reward.eventCoins=12;
if(weeklyDefs[5]?.reward)weeklyDefs[5].reward.eventCoins=18;
if(weeklyDefs[1]?.reward)weeklyDefs[1].reward.gems=60;
if(weeklyDefs[4]?.reward)weeklyDefs[4].reward.gems=80;

// --- Team roster: reserve <-> bench actions; reserve is never discarded. ---
state.reserve=Array.isArray(state.reserve)?state.reserve:[];
function fcucV07NormalizeRoster(){
 const valid=new Set((state.players||[]).map(p=>p.id));
 state.startingXI=(state.startingXI||[]).filter(id=>valid.has(id));
 state.bench=[...new Set((state.bench||[]).filter(id=>valid.has(id)&&!state.startingXI.includes(id)))];
 state.reserve=[...new Set((state.reserve||[]).filter(id=>valid.has(id)&&!state.startingXI.includes(id)&&!state.bench.includes(id)))];
 for(const p of state.players){if(!state.startingXI.includes(p.id)&&!state.bench.includes(p.id)&&!state.reserve.includes(p.id))state.reserve.push(p.id);}
}
fcucV07NormalizeRoster();
function fcucV07Demote(id){const i=state.bench.indexOf(id);if(i<0)return;if(state.reserve.length+state.bench.length+state.startingXI.length<=11){toast('Нельзя оставить клуб без полного состава');return;}state.bench.splice(i,1);if(!state.reserve.includes(id))state.reserve.push(id);save();drawSquad();renderReserve();toast(`${playerById(id).name} переведён в резерв`);}
function fcucV07Promote(id){if(state.startingXI.includes(id)||state.bench.includes(id))return;if(state.bench.length>=7){toast('Запас заполнен. Сначала опусти кого-нибудь в резерв.');return;}state.reserve=state.reserve.filter(x=>x!==id);state.bench.push(id);save();drawSquad();renderReserve();toast(`${playerById(id).name} поднят в запас`);}
const fcucV07DrawSquadBase=drawSquad;
drawSquad=function(){
 fcucV07NormalizeRoster();const pitch=$('#pitch');if(!pitch)return;pitch.querySelectorAll('.player').forEach(x=>x.remove());const positions=positionsFor(state.formation);
 state.startingXI.forEach((id,i)=>{const p=playerById(id),xy=positions[i];if(!p||!xy)return;const eff=fcucV07EffectiveOVR(p,i);const el=document.createElement('button');el.className='player';el.type='button';el.style.left=xy[0]+'%';el.style.top=xy[1]+'%';el.innerHTML=`<i>${eff}</i><small>${fcucSafeText(p.name.split(' ').slice(-1)[0])}</small>`;el.title=`${p.name} · ${p.pos} · ${eff} OVR${eff<p.ovr?` (−${p.ovr-eff} вне позиции)`:''}`;el.addEventListener('click',()=>selectSquadPlayer(i));pitch.append(el);});
 if($('#formationLabel'))$('#formationLabel').textContent=state.formation;
 const bench=$('#benchList');if(bench)bench.innerHTML=state.bench.map(id=>{const p=playerById(id);return `<div class="bench-row" draggable="true" data-roster-drag="${id}"><button class="bench-player" data-bench="${id}"><b>${p.ovr}</b> ${fcucSafeText(p.pos)} · ${fcucSafeText(p.name)}</button><button class="mini-action" data-demote="${id}" title="Перевести в резерв">В РЕЗЕРВ</button><button class="mini-action sell" data-sell="${id}">ПРОДАТЬ</button></div>`;}).join('')||'<span>Запасных пока нет</span>';
 if($('#squadOVR'))$('#squadOVR').textContent=fcucV07TeamRating();renderReserve();updateOverall();
};
const fcucV07RenderReserveBase=renderReserve;
renderReserve=function(){fcucV07NormalizeRoster();const box=$('#reserveList');if(!box)return;const reserve=state.reserve.map(playerById).filter(Boolean);box.innerHTML=reserve.map(p=>`<div class="reserve-row" draggable="true" data-roster-drag="${p.id}"><span><b>${p.ovr}</b> ${fcucSafeText(p.pos)} · ${fcucSafeText(fcucV07DisplayName(p.name))}</span><span><button class="mini-action" data-promote="${p.id}">В ЗАПАС</button><button class="mini-action sell" data-sell="${p.id}">ПРОДАТЬ</button></span></div>`).join('')||'<p class="muted">Резерв пока пуст. Игроки будут перемещаться сюда, а не исчезать.</p>';const count=$('#rosterCount');if(count)count.textContent=state.players.length;const status=$('#exchangeRosterStatus');if(status)status.textContent=`Игроков в клубе: ${state.players.length}/18`;renderExchangeOptions();};
// Cyrillic display for Latin-script names in reserve; source names remain unchanged in save/database.
function fcucV07DisplayName(s){const map={'a':'а','b':'б','c':'к','d':'д','e':'е','f':'ф','g':'г','h':'х','i':'и','j':'дж','k':'к','l':'л','m':'м','n':'н','o':'о','p':'п','q':'к','r':'р','s':'с','t':'т','u':'у','v':'в','w':'в','x':'кс','y':'й','z':'з','á':'а','é':'е','í':'и','ó':'о','ú':'у','ñ':'нь','ç':'с','ø':'ё','æ':'э'};return String(s||'').replace(/[A-Za-zÁÉÍÓÚÑÇØÆáéíóúñçøæ]/g,ch=>map[ch.toLowerCase()]||ch);}
// Re-render only after safe roster state transitions.
document.addEventListener('click',e=>{const demote=e.target.closest('[data-demote]');if(demote){e.preventDefault();e.stopImmediatePropagation();fcucV07Demote(demote.dataset.demote);return;}const promote=e.target.closest('[data-promote]');if(promote){e.preventDefault();e.stopImmediatePropagation();fcucV07Promote(promote.dataset.promote);return;}},true);
let fcucV07Dragged=null;
document.addEventListener('dragstart',e=>{const row=e.target.closest('[data-roster-drag]');if(!row)return;fcucV07Dragged=row.dataset.rosterDrag;e.dataTransfer?.setData('text/plain',fcucV07Dragged);});
document.addEventListener('dragover',e=>{if(e.target.closest('#reserveList')||e.target.closest('#benchList'))e.preventDefault();});
document.addEventListener('drop',e=>{const dest=e.target.closest('#reserveList,#benchList');if(!dest||!fcucV07Dragged)return;e.preventDefault();const id=fcucV07Dragged;fcucV07Dragged=null;if(dest.id==='reserveList'&&state.bench.includes(id))fcucV07Demote(id);else if(dest.id==='benchList'&&state.reserve.includes(id))fcucV07Promote(id);});

// --- Position suitability / OVR debuff ---
const fcucV07Roles={
 '4-3-3':['GK','LB','CB','CB','RB','CM','CM','CAM','LW','ST','RW'],
 '4-2-3-1':['GK','LB','CB','CB','RB','CDM','CDM','CAM','LW','RW','ST'],
 '4-4-2':['GK','LB','CB','CB','RB','LM','CM','CM','RM','ST','ST'],
 '3-5-2':['GK','CB','CB','CB','LWB','CM','CDM','CM','RWB','ST','ST']
};
function fcucV07PositionPenalty(pos,role){if(pos===role)return 0;const groups={GK:['GK'],CB:['CB'],FB:['LB','RB','LWB','RWB'],DM:['CDM'],CM:['CM'],AM:['CAM'],W:['LW','RW','LM','RM'],ST:['ST']};const group=p=>Object.keys(groups).find(k=>groups[k].includes(p));const a=group(pos),b=group(role);if(a===b)return 1;if((a==='CM'&&b==='DM')||(a==='DM'&&b==='CM')||(a==='AM'&&b==='CM')||(a==='CM'&&b==='AM')||(a==='W'&&b==='FB')||(a==='FB'&&b==='W'))return 3;if(a==='GK'||b==='GK')return 15;return 7;}
function fcucV07EffectiveOVR(p,index){const role=(fcucV07Roles[state.formation]||fcucV07Roles['4-3-3'])[index];return Math.max(30,Number(p?.ovr||50)-fcucV07PositionPenalty(p?.pos,role));}
function fcucV07TeamRating(){return Math.round((state.startingXI||[]).reduce((n,id,i)=>n+fcucV07EffectiveOVR(playerById(id),i),0)/Math.max(1,state.startingXI.length));}
updateOverall=function(){const avg=fcucV07TeamRating();if($('#homeOVR'))$('#homeOVR').textContent=avg;if($('#homeOVRBar'))$('#homeOVRBar').style.width=avg+'%';if($('#squadOVR'))$('#squadOVR').textContent=avg;};

// --- Market sort ---
const sortBox=$('#marketSort');
if(sortBox){sortBox.value=state.marketSort||'rating-desc';sortBox.addEventListener('change',()=>{state.marketSort=sortBox.value;save();renderMarket();});}
const fcucV07RenderMarketBase=renderMarket;
renderMarket=function(){fcucV07RenderMarketBase();const grid=$('#marketGrid');if(!grid)return;const selected=$('#marketSort')?.value||state.marketSort||'rating-desc';const cards=[...grid.querySelectorAll('.market-card')];cards.sort((a,b)=>{const get=x=>Number(x.querySelector('.card-art b')?.textContent||0);const price=x=>Number((x.querySelector('.price-row span')?.textContent||'').replace(/[^0-9]/g,''))||0;return selected==='rating-asc'?get(a)-get(b):selected==='price-asc'?price(a)-price(b):selected==='price-desc'?price(b)-price(a):get(b)-get(a);});cards.forEach(x=>grid.append(x));};

// --- Opponent rotation ---
const fcucV07Opponents=[
 ['Northbridge FC',57],['Aurora Athletic',61],['Polar City',64],['Blue Comets',67],['Riverside United',70],['Iron Wolves',73],['Frostvale SC',76],['Glacier Town',79],['Stormhaven FC',82],['Wintergate',85]
];
function fcucV07SetOpponent(){const item=fcucV07Opponents[Math.floor(Math.random()*fcucV07Opponents.length)];match.opponent={name:item[0],ovr:item[1]};const spans=$$('.score span');if(spans[1])spans[1].textContent=item[0];const panel=$('.opponent');if(panel){const strong=panel.querySelector('strong'),small=panel.querySelector('small');if(strong)strong.textContent=item[0].toUpperCase();if(small)small.textContent=`Рейтинг ${item[1]} · ${item[1]>=78?'Сложный':item[1]>=68?'Средний':'Доступный'} соперник`;}}
const fcucV07StartMatchBase=startMatch;
startMatch=function(){if(match.active)return;fcucV07StartMatchBase();if(match.active){match.mode='normal';fcucV07SetOpponent();match.homeName=state.club?.name||'FROST UNITED';const spans=$$('.score span');if(spans[0])spans[0].textContent=match.homeName;save();}};
const fcucV07PlayEventBase=playEventMatch;
playEventMatch=function(){fcucV07RefreshCycles();if((Number(state.eventMatchesToday)||0)>=3){toast('Лимит зимних матчей на сегодня исчерпан: максимум 3. Новые матчи будут доступны после 00:00.');return;}if(match.active){toast('Сначала заверши текущий матч');return;}fcucV07PlayEventBase();if(match.active){match.mode='event';fcucV07SetOpponent();save();}};

// Match probability now uses the effective XI rating (including off-position penalties)
// and each opponent's strength, instead of a fixed generic opponent.
matchTick=function(){
 if(!match.active||match._finishing)return;
 match.minute++;
 const avg=fcucV07TeamRating();
 let mod=fcucTacticGoalModifier();if(match.style==='Атака')mod+=.003;else if(match.style==='Оборона')mod-=.003;
 const strength=Math.max(.78,Math.min(1.24,.94+(avg-60)*.006));
 const homeChance=Math.max(.006,Math.min(.032,(.014+mod)*strength));
 const opp=Number(match.opponent?.ovr||68);
 const awayStyle=match.style==='Оборона'?.002:match.style==='Атака'?-.001:0;const awayChance=Math.max(.006,Math.min(.032,.009+(opp-55)*.00055+fcucTacticAwayModifier()-awayStyle));
 if(match.home<5&&Math.random()<homeChance){match.home++;addStat('goals');matchLog('ГОЛ! '+(state.club?.name||'Клуб')+' забивает!');state.seasonXP=(Number(state.seasonXP)||0)+10;if(match.mode==='event'){state.eventPoints=(Number(state.eventPoints)||0)+10;if(state.weeklyProgress)state.weeklyProgress.eventPoints=(Number(state.weeklyProgress.eventPoints)||0)+10;}}
 else if(match.away<5&&Math.random()<awayChance){match.away++;matchLog(`${match.opponent?.name||'Соперник'} забивает гол.`);}
 else if(match.minute%7===0)matchLog(['Опасная атака хозяев','Удар — вратарь спасает','Подача с фланга','Перехват в центре поля','Стандарт у ворот соперника'][Math.floor(Math.random()*5)]);
 renderMatchSetup();if($('#matchTimeline'))$('#matchTimeline').style.width=(match.minute/90*100)+'%';
 if(match.minute>=90)finishMatch();save();
};

// --- Reliable match finish / skip controls, including mobile tap ---
const fcucV07FinishBase=finishMatch;
finishMatch=function(){if(!match?.active||match._finishing||match._finished)return;match._finishing=true;try{const isEvent=match.mode==='event',won=match.home>match.away,beforeTokens=Number(state.eventTokens)||0,beforeWinter=Number(state.winterGems)||0;fcucV07FinishBase();state.dailyProgress=state.dailyProgress||{matches:0,goals:0,wins:0};state.branchProgress=state.branchProgress||{matches:0,goals:0,wins:0,packs:0};state.dailyProgress.matches=(Number(state.dailyProgress.matches)||0)+1;state.branchProgress.matches=(Number(state.branchProgress.matches)||0)+1;if(won){state.dailyProgress.wins=(Number(state.dailyProgress.wins)||0)+1;state.branchProgress.wins=(Number(state.branchProgress.wins)||0)+1;}if(isEvent){state.eventTokens=beforeTokens+(won?10:match.home===match.away?7:5);state.winterGems=beforeWinter+(won?2:1);state.eventCoins=state.winterGems;state.eventMatchesToday=(Number(state.eventMatchesToday)||0)+1;state.eventMatchDate=fcucV07DateKey();const b=$('#eventMatchPlay');if(b){const left=Math.max(0,3-state.eventMatchesToday);b.disabled=left===0;b.textContent=left===0?'ЛИМИТ НА СЕГОДНЯ ИСЧЕРПАН':`НАЧАТЬ ЗИМНИЙ МАТЧ · ${left}/3 ОСТАЛОСЬ`;}}save();updateWallet();renderDaily();renderBranch();renderEventMode();}finally{match._finished=true;match._finishing=false;}};
function fcucV07SkipMatch(){if(!match.active)startMatch();if(!match.active)return;clearInterval(match.timer);match.timer=null;let guard=0;while(match.active&&match.minute<90&&guard++<91){matchTick();}if(match.active){match.minute=90;renderMatchSetup();if($('#matchTimeline'))$('#matchTimeline').style.width='100%';finishMatch();}else{renderMatchSetup();}}
document.addEventListener('click',e=>{const skip=e.target.closest('#matchSkip');if(skip){e.preventDefault();e.stopImmediatePropagation();fcucV07SkipMatch();return;}const end=e.target.closest('#matchEnd');if(end){e.preventDefault();e.stopImmediatePropagation();if(match.active)finishMatch();else toast('Матч уже завершён');return;}},true);
// Repaint the match controls and timeline consistently after visibility changes.
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&match.active){renderMatchSetup();if($('#matchTimeline'))$('#matchTimeline').style.width=(match.minute/90*100)+'%';}});

// Event match daily limit status at page open.
const fcucV07NavigateBase=navigate;
navigate=function(page){fcucV07NavigateBase(page);if(page==='event'){fcucV07RefreshCycles();const b=$('#eventMatchPlay');if(b){const left=Math.max(0,3-(Number(state.eventMatchesToday)||0));b.disabled=left===0;b.textContent=left===0?'ЛИМИТ НА СЕГОДНЯ ИСЧЕРПАН':`НАЧАТЬ ЗИМНИЙ МАТЧ · ${left}/3 ОСТАЛОСЬ`;}}if(page==='match'){const f=$('#matchFormation');if(f)f.value=state.formation;const s=$('#matchStyle');if(s)s.value=state.style;}};

// --- Gentle original winter bell music (no external copyrighted track) ---
let fcucV07Audio=null,fcucV07MusicTimer=null,fcucV07Note=0;
const fcucV07Melody=[659.25,783.99,987.77,783.99,698.46,880,1046.5,880,659.25,783.99,880,783.99,587.33,698.46,783.99,698.46];
function fcucV07MusicStop(){if(fcucV07MusicTimer){clearTimeout(fcucV07MusicTimer);fcucV07MusicTimer=null;}if(fcucV07Audio){try{fcucV07Audio.close();}catch(e){}fcucV07Audio=null;}}
function fcucV07MusicStep(){if(!fcucV07Audio||!state.musicEnabled)return;const ctx=fcucV07Audio,now=ctx.currentTime,f=fcucV07Melody[fcucV07Note++%fcucV07Melody.length];const osc=ctx.createOscillator(),gain=ctx.createGain();osc.type='sine';osc.frequency.value=f;gain.gain.setValueAtTime(.0001,now);gain.gain.exponentialRampToValueAtTime(.035,now+.025);gain.gain.exponentialRampToValueAtTime(.0001,now+.72);osc.connect(gain);gain.connect(ctx.destination);osc.start(now);osc.stop(now+.75);fcucV07MusicTimer=setTimeout(fcucV07MusicStep,560);}
function fcucV07MusicStart(){const AC=window.AudioContext||window.webkitAudioContext;if(!AC){toast('Браузер не поддерживает фоновую музыку');return;}if(!fcucV07Audio)fcucV07Audio=new AC();if(fcucV07Audio.state==='suspended')fcucV07Audio.resume();state.musicEnabled=true;save();fcucV07MusicStep();const b=$('#musicToggle');if(b)b.textContent='♫ НОВОГОДНЯЯ МУЗЫКА: ВКЛ';}
function fcucV07MusicToggle(){if(state.musicEnabled){state.musicEnabled=false;fcucV07MusicStop();save();const b=$('#musicToggle');if(b)b.textContent='♫ НОВОГОДНЯЯ МУЗЫКА: ВЫКЛ';}else fcucV07MusicStart();}
$('#musicToggle')?.addEventListener('click',fcucV07MusicToggle);
if($('#musicToggle'))$('#musicToggle').textContent=state.musicEnabled?'♫ НОВОГОДНЯЯ МУЗЫКА: ВКЛ':'♫ НОВОГОДНЯЯ МУЗЫКА: ВЫКЛ';

// --- Extra club identity settings ---
state.club=state.club||{};state.club.stadium=state.club.stadium||'Winter Arena';state.club.motto=state.club.motto||'ONE CLUB · ONE DREAM';
const clubSettings=$('#clubExtraSettings');if(clubSettings){clubSettings.innerHTML=`<label for="clubStadiumInput">СТАДИОН</label><input id="clubStadiumInput" maxlength="32" value="${fcucSafeText(state.club.stadium)}" placeholder="Название стадиона"><label for="clubMottoInput">ДЕВИЗ КЛУБА</label><input id="clubMottoInput" maxlength="42" value="${fcucSafeText(state.club.motto)}" placeholder="Девиз клуба">`;}
const saveClubV07=$('#saveClubSettings');saveClubV07?.addEventListener('click',()=>{state.club.stadium=($('#clubStadiumInput')?.value||'Winter Arena').trim().slice(0,32);state.club.motto=($('#clubMottoInput')?.value||'ONE CLUB · ONE DREAM').trim().slice(0,42);save();toast('Стадион и девиз клуба сохранены');});

// Full reset must remove both current and legacy save keys, otherwise an old
// migration could silently restore the career after the user deletes it.
const fcucV07ResetHandler=e=>{if(!e.target.closest('#resetSave,#resetSaveSettings'))return;e.preventDefault();e.stopImmediatePropagation();if(!confirm('Полностью удалить карьеру, валюты, состав и все настройки? Это действие нельзя отменить.'))return;try{localStorage.removeItem(STORE_KEY);localStorage.removeItem(FCUC_V06_OLD_SAVE_KEY);localStorage.removeItem('fcuc_winter_save_v4');localStorage.removeItem('fcuc_winter_save_v3');}catch(err){}location.reload();};document.addEventListener('click',fcucV07ResetHandler,true);

// Keep the chosen formation/style in sync between squad and match screens.
$('#formation')?.addEventListener('change',e=>{state.formation=e.target.value;if($('#matchFormation'))$('#matchFormation').value=state.formation;save();drawSquad();updateOverall();});
$('#matchFormation')?.addEventListener('change',e=>{state.formation=e.target.value;if($('#formation'))$('#formation').value=state.formation;match.formation=state.formation;save();drawSquad();updateOverall();if(match.active)matchLog(`Схема изменена: ${state.formation}`);});
$('#matchStyle')?.addEventListener('change',e=>{state.style=e.target.value;match.style=state.style;$$('.styles button').forEach(b=>b.classList.toggle('selected',b.textContent.trim()===state.style));save();});
$$('.styles button').forEach(b=>b.addEventListener('click',()=>{if($('#matchStyle'))$('#matchStyle').value=state.style;}));

// Persist and restore quest cycles, counters and event match limit safely.
state.quest3DayAnchor=state.quest3DayAnchor||state.dailyDate||fcucV07DateKey();state.eventMatchDate=state.eventMatchDate||fcucV07DateKey();state.eventMatchesToday=Number(state.eventMatchesToday)||0;state.musicEnabled=false;state.marketSort=state.marketSort||'rating-desc';
fcucV07RefreshCycles();
const oldTimer=setInterval(()=>{fcucV07RefreshCycles();renderDaily();renderBranch();fcucV07UpdateCountdowns();},30000);
renderDaily();renderBranch();fcucV07UpdateCountdowns();renderEventMode();renderMarket();drawSquad();updateOverall();updateWallet();save();
// Share v0.7 helpers with the following version layers (each is isolated in an IIFE).
Object.assign(window,{fcucV07DateKey,fcucV07DayNumber,fcucV07Monday,fcucV07RefreshCycles,fcucV07UpdateCountdowns,fcucV07NormalizeRoster,fcucV07PositionPenalty,fcucV07EffectiveOVR,fcucV07Roles,fcucV07MusicStart,fcucV07MusicStep,fcucV07MusicStop});
})();


/* ================= FC ULTIMATE CLUB v0.8 =================
   Rating-based squad selection, automatic substitutions, English player
   names, weekly rotating objectives, event path rewards and audio options.
*/
(function(){
'use strict';

// All player names are shown in Latin/English script, including the club,
// transfer market, event cards, bench and reserve. Source data is preserved
// in the user's own files; the in-game copy is normalized once on load.
function fcucV08LatinName(value){
 const map={
 'а':'a','б':'b','в':'v','г':'g','д':'d','е':'e','ё':'yo','ж':'zh','з':'z','и':'i','й':'y',
 'к':'k','л':'l','м':'m','н':'n','о':'o','п':'p','р':'r','с':'s','т':'t','у':'u','ф':'f',
 'х':'kh','ц':'ts','ч':'ch','ш':'sh','щ':'shch','ъ':'','ы':'y','ь':'','э':'e','ю':'yu','я':'ya',
 'і':'i','ї':'yi','є':'ye','ґ':'g'
 };
 return String(value??'').replace(/[А-Яа-яЁёІіЇїЄєҐґ]/g,ch=>{
  const latin=map[ch.toLowerCase()]||ch;
  return ch===ch.toUpperCase()?latin.charAt(0).toUpperCase()+latin.slice(1):latin;
 });
}
function fcucV08Englishize(list){
 if(!Array.isArray(list))return;
 for(const p of list)if(p&&typeof p.name==='string')p.name=fcucV08LatinName(p.name);
}
fcucV08Englishize(state.players);
fcucV08Englishize(state.market);
fcucV08Englishize(defaultPlayers);
fcucV08Englishize(marketSeed);
if(typeof FCUC_PLAYER_DB!=='undefined')fcucV08Englishize(FCUC_PLAYER_DB);

if(typeof FCUC_EVENT_DB!=='undefined')fcucV08Englishize(FCUC_EVENT_DB);
// The previous build transliterated Latin names back into Cyrillic in the
// reserve panel. Override that renderer so every roster area stays English.
renderReserve=function(){
 fcucV07NormalizeRoster();
 const box=$('#reserveList');if(!box)return;
 box.innerHTML=(state.reserve||[]).map(id=>{
  const p=playerById(id);if(!p)return '';
  return `<div class="reserve-row" draggable="true" data-roster-drag="${p.id}"><span><b>${p.ovr}</b> ${fcucSafeText(p.pos)} · ${fcucSafeText(p.name)}</span><span><button class="mini-action" data-promote="${p.id}">В ЗАПАС</button><button class="mini-action sell" data-sell="${p.id}">ПРОДАТЬ</button></span></div>`;
 }).join('')||'<p class="muted">Reserve is empty.</p>';
 const count=$('#rosterCount');if(count)count.textContent=state.players.length;
 const status=$('#exchangeRosterStatus');if(status)status.textContent=`Players in club: ${state.players.length}/18`;
 renderExchangeOptions();
};
const fcucV08RenderMarketBase=renderMarket;
renderMarket=function(){fcucV08Englishize(state.market);fcucV08RenderMarketBase();};

// Rotating weekly missions. A stable week key picks a different set each
// Monday, while the ordinary currency rewards stay separate from event tokens.
const fcucV08WeeklySets=[
 [
  {title:'Матчевый ритм',desc:'Заверши пять матчей',stat:'matches',goal:5,reward:{coins:18000}},
  {title:'Хладнокровный бомбардир',desc:'Забей восемь голов',stat:'goals',goal:8,reward:{gems:12}},
  {title:'Победная серия',desc:'Выиграй три матча',stat:'wins',goal:3,reward:{coins:22000}},
  {title:'Новое подписание',desc:'Подпиши одного игрока',stat:'buys',goal:1,reward:{coins:12000}},
  {title:'Открытие наборов',desc:'Открой два набора',stat:'packs',goal:2,reward:{gems:15}}
 ],
 [
  {title:'Лиговая кампания',desc:'Заверши семь матчей',stat:'matches',goal:7,reward:{coins:24000}},
  {title:'Голевая машина',desc:'Забей десять голов',stat:'goals',goal:10,reward:{gems:18}},
  {title:'Три очка',desc:'Выиграй четыре матча',stat:'wins',goal:4,reward:{coins:26000}},
  {title:'Трансферная работа',desc:'Подпиши двух игроков',stat:'buys',goal:2,reward:{coins:18000}},
  {title:'День скаутинга',desc:'Открой три набора',stat:'packs',goal:3,reward:{gems:20}}
 ],
 [
  {title:'Плотный календарь',desc:'Заверши четыре матча',stat:'matches',goal:4,reward:{coins:15000}},
  {title:'В девятку',desc:'Забей шесть голов',stat:'goals',goal:6,reward:{gems:14}},
  {title:'Несгибаемый дух',desc:'Выиграй два матча',stat:'wins',goal:2,reward:{coins:17000}},
  {title:'Строитель клуба',desc:'Подпиши одного игрока',stat:'buys',goal:1,reward:{gems:10}},
  {title:'Скаут академии',desc:'Открой один набор',stat:'packs',goal:1,reward:{coins:10000}}
 ],
 [
  {title:'Полный календарь',desc:'Заверши восемь матчей',stat:'matches',goal:8,reward:{coins:28000}},
  {title:'Сила атаки',desc:'Забей двенадцать голов',stat:'goals',goal:12,reward:{gems:22}},
  {title:'Неделя побед',desc:'Выиграй пять матчей',stat:'wins',goal:5,reward:{coins:30000}},
  {title:'Мастер рынка',desc:'Подпиши двух игроков',stat:'buys',goal:2,reward:{gems:18}},
  {title:'Коллекционер наборов',desc:'Открой четыре набора',stat:'packs',goal:4,reward:{coins:22000}}
 ],
 [
  {title:'Путь к славе',desc:'Заверши шесть матчей',stat:'matches',goal:6,reward:{coins:21000}},
  {title:'Меткий форвард',desc:'Забей девять голов',stat:'goals',goal:9,reward:{gems:16}},
  {title:'Большие результаты',desc:'Выиграй четыре матча',stat:'wins',goal:4,reward:{coins:24000}},
  {title:'Свежий талант',desc:'Подпиши одного игрока',stat:'buys',goal:1,reward:{coins:14000}},
  {title:'Открой коробку',desc:'Открой два набора',stat:'packs',goal:2,reward:{gems:16}}
 ],
 [
  {title:'Вызов сезона',desc:'Заверши девять матчей',stat:'matches',goal:9,reward:{coins:32000}},
  {title:'Гонка за золотой бутсой',desc:'Забей четырнадцать голов',stat:'goals',goal:14,reward:{gems:25}},
  {title:'Менталитет чемпиона',desc:'Выиграй пять матчей',stat:'wins',goal:5,reward:{coins:32000}},
  {title:'Трансферное окно',desc:'Подпиши трёх игроков',stat:'buys',goal:3,reward:{coins:24000}},
  {title:'Специалист по наборам',desc:'Открой три набора',stat:'packs',goal:3,reward:{gems:22}}
 ]
];
const fcucV08BranchSets=[
 [
  {title:'Первый свисток',desc:'Заверши четыре матча',stat:'matches',goal:4},
  {title:'Создатель голов',desc:'Забей семь голов',stat:'goals',goal:7},
  {title:'Победный характер',desc:'Выиграй три матча',stat:'wins',goal:3},
  {title:'Скаутская работа',desc:'Открой один набор',stat:'packs',goal:1}
 ],
 [
  {title:'Игровой ритм',desc:'Заверши шесть матчей',stat:'matches',goal:6},
  {title:'Точный удар',desc:'Забей девять голов',stat:'goals',goal:9},
  {title:'Сильная концовка',desc:'Выиграй четыре матча',stat:'wins',goal:4},
  {title:'Новые лица',desc:'Открой два набора',stat:'packs',goal:2}
 ],
 [
  {title:'Зимний календарь',desc:'Заверши три матча',stat:'matches',goal:3},
  {title:'Ледяное хладнокровие',desc:'Забей пять голов',stat:'goals',goal:5},
  {title:'Три победы',desc:'Выиграй три матча',stat:'wins',goal:3},
  {title:'Подбор мяча',desc:'Открой два набора',stat:'packs',goal:2}
 ],
 [
  {title:'Насыщенная неделя',desc:'Заверши семь матчей',stat:'matches',goal:7},
  {title:'Атакующая мощь',desc:'Забей одиннадцать голов',stat:'goals',goal:11},
  {title:'На пьедестал',desc:'Выиграй пять матчей',stat:'wins',goal:5},
  {title:'Охотник за наборами',desc:'Открой три набора',stat:'packs',goal:3}
 ],
 [
  {title:'Продолжай играть',desc:'Заверши пять матчей',stat:'matches',goal:5},
  {title:'Голевая неделя',desc:'Забей восемь голов',stat:'goals',goal:8},
  {title:'Путь побед',desc:'Выиграй два матча',stat:'wins',goal:2},
  {title:'Умный выбор',desc:'Открой один набор',stat:'packs',goal:1}
 ],
 [
  {title:'Зимний марафон',desc:'Заверши восемь матчей',stat:'matches',goal:8},
  {title:'Голевая феерия',desc:'Забей тринадцать голов',stat:'goals',goal:13},
  {title:'Не остановить',desc:'Выиграй пять матчей',stat:'wins',goal:5},
  {title:'Активный набор',desc:'Открой четыре набора',stat:'packs',goal:4}
 ]
];
function fcucV08WeekIndex(){
 const key=state.weekStart||fcucV07Monday();
 const [y,m,d]=key.split('-').map(Number);
 return Math.floor(fcucV07DayNumber(key)/7)%fcucV08WeeklySets.length;
}
let fcucV08ActiveRenderedKey=null;
function fcucV08ApplyWeeklySet(){
 const key=state.weekStart||fcucV07Monday();
 if(fcucV08ActiveRenderedKey===key)return;
 const changed=state.weeklyQuestSetKey!==key;
 const index=fcucV08WeekIndex();
 weeklyDefs.splice(0,weeklyDefs.length,...fcucV08WeeklySets[index].map(q=>({...q,reward:{...q.reward}})));
 branchDefs.splice(0,branchDefs.length,...fcucV08BranchSets[index].map(q=>({...q})));
 state.weeklyQuestSetKey=key;
 fcucV08ActiveRenderedKey=key;
 if(!state.weeklyProgress)state.weeklyProgress={};
 if(!state.weeklyClaimed)state.weeklyClaimed=[];
 if(!state.branchProgress)state.branchProgress={};
 if(changed)save();
}
const fcucV08RefreshBase=fcucV07RefreshCycles;
fcucV07RefreshCycles=function(){
 const before=state.weekStart;
 fcucV08RefreshBase();
 if(before!==state.weekStart)state.weeklyQuestSetKey=null;
 fcucV08ApplyWeeklySet();
};
fcucV08ApplyWeeklySet();

// Event path: first two rewards are always open; later milestones unlock from
// event points. Event tokens are only spent in the event player market.
const fcucV08PathRewards=[
 {label:'Жетоны события',detail:'15 жетонов события',unlock:0,type:'tokens',amount:15},
 {label:'Жетоны события',detail:'25 жетонов события',unlock:0,type:'tokens',amount:25},
 {label:'Жетоны события',detail:'35 жетонов события',unlock:250,type:'tokens',amount:35},
 {label:'Игрок события',detail:'Одна зимняя карточка',unlock:500,type:'player',amount:1},
 {label:'Особый игрок',detail:'Одна карточка высокого рейтинга',unlock:1000,type:'elite',amount:1}
];
state.eventPathClaimed=Array.isArray(state.eventPathClaimed)?state.eventPathClaimed:[];
function fcucV08RenderPath(){
 const box=$('#eventPathRewards');if(!box)return;
 const points=Number(state.eventPoints)||0;
 box.innerHTML=fcucV08PathRewards.map((r,i)=>{
  const claimed=state.eventPathClaimed.includes(i);
  const open=i<2||points>=r.unlock;
  return `<article class="reward ${claimed?'done':open?'current':'locked'}"><small>${i+1}</small><b>${r.unlock?`${r.unlock} ОЧКОВ`:'ОТКРЫТО'}</b><span>${r.detail}</span><button class="claim" data-event-path="${i}" ${claimed||!open?'disabled':''}>${claimed?'ПОЛУЧЕНО':open?'ЗАБРАТЬ':'ЗАКРЫТО'}</button></article>`;
 }).join('');
}
document.addEventListener('click',e=>{
 const b=e.target.closest('[data-event-path]');if(!b)return;
 e.preventDefault();e.stopImmediatePropagation();
 const i=Number(b.dataset.eventPath),r=fcucV08PathRewards[i];
 if(!r||state.eventPathClaimed.includes(i)||(i>=2&&(Number(state.eventPoints)||0)<r.unlock))return;
 if(r.type==='tokens')state.eventTokens=(Number(state.eventTokens)||0)+r.amount;
 else{
  let pool=(FCUC_EVENT_DB||[]).filter(p=>!fcucOwned(p.name));
  if(r.type==='elite')pool=pool.filter(p=>Number(p.ovr)>=77);
  if(!pool.length){state.eventTokens=(Number(state.eventTokens)||0)+50;toast('Все карточки собраны — вместо игрока начислено 50 жетонов события.');}
  else{
   const p=pool[Math.floor(Math.random()*pool.length)];
   if(!fcucAddToClub(p,'event-path'))return;
  }
 }
 state.eventPathClaimed.push(i);save();updateWallet();fcucV08RenderPath();renderEventMode();drawSquad();renderReserve();
 toast('Награда Зимнего пути получена!');
},true);
const fcucV08RenderEventBase=renderEventMode;
renderEventMode=function(){fcucV08RenderEventBase();fcucV08RenderPath();};

// Rating-first XI selection: best available player for every role, no duplicate
// cards, with the existing positional penalty included in the score.
function fcucV08AutoPick(){
 fcucV07NormalizeRoster();
 const all=[...new Set((state.players||[]).map(p=>p.id))];
 if(all.length<11){toast('Нужно минимум 11 игроков в клубе');return;}
 const roles=fcucV07Roles[state.formation]||fcucV07Roles['4-3-3'];
 const remaining=new Set(all),xi=[];
 roles.forEach((role,index)=>{
  let best=null,bestScore=-Infinity;
  for(const id of remaining){
   const p=playerById(id);
   const score=Number(p.ovr||50)-fcucV07PositionPenalty(p.pos,role);
   if(score>bestScore){bestScore=score;best=id;}
  }
  if(best){xi.push(best);remaining.delete(best);}
 });
 state.startingXI=xi;
 const left=[...remaining].sort((a,b)=>Number(playerById(b).ovr||0)-Number(playerById(a).ovr||0));
 state.bench=left.slice(0,7);
 state.reserve=left.slice(7);
 save();drawSquad();renderReserve();updateOverall();
 toast('Автоподбор готов: лучшие игроки выставлены по позициям.');
}
function fcucV08AutoSubs(){
 if(!match?.active){toast('Сначала начни матч');return;}
 let made=0;
 while(made<5){
  let best=null,bestGain=0;
  for(let bi=0;bi<state.bench.length;bi++){
   const sub=playerById(state.bench[bi]);
   for(let si=0;si<state.startingXI.length;si++){
    const starter=playerById(state.startingXI[si]);
    const gain=fcucV07EffectiveOVR(sub,si)-fcucV07EffectiveOVR(starter,si);
    if(gain>bestGain){bestGain=gain;best={bi,si,subId:sub.id,starterId:starter.id};}
   }
  }
  if(!best)break;
  state.bench[best.bi]=best.starterId;
  state.startingXI[best.si]=best.subId;
  made++;
 }
 save();drawSquad();renderReserve();updateOverall();
 if(made)matchLog(`Автозамены по рейтингу: выполнено ${made}/5.`);
 toast(made?`Автоматически выполнено замен: ${made}`:'На скамейке нет игроков с более высоким рейтингом.');
}
document.addEventListener('click',e=>{
 if(e.target.closest('#autoPickXI')){e.preventDefault();fcucV08AutoPick();return;}
 if(e.target.closest('#autoSubsRating')){e.preventDefault();e.stopImmediatePropagation();window.fcucV091AutoSubs?.();return;}
},true);

// Keep all currency types independent. Winter gems pay for winter packs;
// event tokens pay only for cards in the event player market.
state.eventTokens=Number(state.eventTokens)||0;
state.winterGems=Number(state.winterGems??state.eventCoins??0);
state.eventCoins=state.winterGems;
const wallet=$('.wallet');
if(wallet&&!$('#eventTokensTop')){
 const item=document.createElement('div');item.innerHTML='<b>✧ <span id="eventTokensTop">0</span></b><small>ЖЕТОНЫ СОБЫТИЯ</small>';wallet.insertBefore(item,wallet.querySelector('.avatar'));
}
const fcucV08WalletBase=updateWallet;
updateWallet=function(){
 state.eventCoins=Number(state.winterGems)||0;
 fcucV08WalletBase();
 const el=$('#eventTokensTop');if(el)el.textContent=fmt(state.eventTokens||0);
 const g=$('#eventGemBalance');if(g)g.textContent=fmt(state.winterGems||0);
 const t=$('#eventTokenBalance');if(t)t.textContent=fmt(state.eventTokens||0);
 const t2=$('#eventTokenBalance2');if(t2)t2.textContent=fmt(state.eventTokens||0);
};

// Two original selectable music styles + subtle UI click effects. No external
// music files or copyrighted FC Mobile tracks are used.
state.musicMode=state.musicMode||'winter';
state.soundEffects=state.soundEffects!==false;
const settings=$('#clubExtraSettings');
if(settings){
 const music=document.createElement('label');music.htmlFor='musicModeSelect';music.textContent='МУЗЫКА';
 const select=document.createElement('select');select.id='musicModeSelect';
 select.innerHTML='<option value="off">Выключена</option><option value="winter">Зимняя мелодия</option><option value="football">Футбольная атмосфера</option>';
 select.value=state.musicEnabled?state.musicMode:'off';
 settings.append(music,select);
 const sfx=document.createElement('label');sfx.htmlFor='sfxModeSelect';sfx.textContent='ЗВУКИ ИНТЕРФЕЙСА';
 const sfxSelect=document.createElement('select');sfxSelect.id='sfxModeSelect';
 sfxSelect.innerHTML='<option value="on">Включены</option><option value="off">Выключены</option>';
 sfxSelect.value=state.soundEffects?'on':'off';settings.append(sfx,sfxSelect);
}
function fcucV08MusicStep(){
 if(!fcucV07Audio||!state.musicEnabled)return;
 const ctx=fcucV07Audio,now=ctx.currentTime;
 const winter=[659.25,783.99,987.77,783.99,698.46,880,1046.5,880,587.33,698.46,783.99,698.46];
 const football=[392,440,523.25,659.25,587.33,523.25,440,392,349.23,440,523.25,587.33];
 const notes=state.musicMode==='football'?football:winter;
 const n=notes[fcucV07Note++%notes.length];
 const osc=ctx.createOscillator(),gain=ctx.createGain();
 osc.type=state.musicMode==='football'?'triangle':'sine';osc.frequency.value=n;
 gain.gain.setValueAtTime(.0001,now);gain.gain.exponentialRampToValueAtTime(state.musicMode==='football'?.022:.03,now+.03);gain.gain.exponentialRampToValueAtTime(.0001,now+.55);
 osc.connect(gain);gain.connect(ctx.destination);osc.start(now);osc.stop(now+.58);
 if(state.musicMode==='football'&&fcucV07Note%2===0){
  const bass=ctx.createOscillator(),bg=ctx.createGain();bass.type='sine';bass.frequency.value=n/2;
  bg.gain.setValueAtTime(.0001,now);bg.gain.exponentialRampToValueAtTime(.012,now+.02);bg.gain.exponentialRampToValueAtTime(.0001,now+.25);
  bass.connect(bg);bg.connect(ctx.destination);bass.start(now);bass.stop(now+.27);
 }
 fcucV07MusicTimer=setTimeout(fcucV08MusicStep,state.musicMode==='football'?430:590);
}
fcucV07MusicStep=fcucV08MusicStep;
const fcucV08MusicStartBase=fcucV07MusicStart;
fcucV07MusicStart=function(){
 const AC=window.AudioContext||window.webkitAudioContext;
 if(!AC){toast('Аудио не поддерживается этим браузером');return;}
 if(!fcucV07Audio)fcucV07Audio=new AC();
 if(fcucV07Audio.state==='suspended')fcucV07Audio.resume();
 state.musicEnabled=true;save();fcucV08MusicStep();
 const b=$('#musicToggle');if(b)b.textContent='♫ МУЗЫКА: ВКЛ';
};
$('#musicModeSelect')?.addEventListener('change',e=>{
 state.musicMode=e.target.value;
 if(state.musicMode==='off'){state.musicEnabled=false;fcucV07MusicStop();}
 else{state.musicEnabled=false;fcucV07MusicStop();fcucV07MusicStart();}
 save();
});
$('#sfxModeSelect')?.addEventListener('change',e=>{state.soundEffects=e.target.value==='on';save();});
let fcucV08Sfx=null;
function fcucV08ClickSound(){
 if(!state.soundEffects)return;
 try{
  const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
  if(!fcucV08Sfx)fcucV08Sfx=new AC();
  if(fcucV08Sfx.state==='suspended')fcucV08Sfx.resume();
  const ctx=fcucV08Sfx,osc=ctx.createOscillator(),gain=ctx.createGain(),now=ctx.currentTime;
  osc.type='sine';osc.frequency.setValueAtTime(620,now);osc.frequency.exponentialRampToValueAtTime(460,now+.055);
  gain.gain.setValueAtTime(.0001,now);gain.gain.exponentialRampToValueAtTime(.018,now+.008);gain.gain.exponentialRampToValueAtTime(.0001,now+.07);
  osc.connect(gain);gain.connect(ctx.destination);osc.start(now);osc.stop(now+.075);
 }catch(_){}
}
document.addEventListener('pointerdown',e=>{
 const target=e.target.closest('button,.nav,.claim,.primary,.outline');
 if(target&&!target.disabled)fcucV08ClickSound();
},{capture:true,passive:true});
const oldMusicBtn=$('#musicToggle');
if(oldMusicBtn){oldMusicBtn.textContent=state.musicEnabled?'♫ МУЗЫКА: ВКЛ':'♫ МУЗЫКА: ВЫКЛ';}

// Hide the retired event side-challenges and keep only the main event path,
// 3-day missions and weekly talent branch.
const oldExtra=$('#eventQuests');
if(oldExtra){const heading=oldExtra.previousElementSibling;if(heading?.textContent?.includes('ДОПОЛНИТЕЛЬНЫЕ'))heading.remove();oldExtra.remove();}
const oldDailyTitle=$('#event .section-head');
if(oldDailyTitle){/* preserve the normal 3-day event challenges */}
fcucV08RenderPath();
updateWallet();
renderAll();
renderEventMode();
drawSquad();
renderMarket();
save();
// Expose v0.8 patch helpers to v0.9 without duplicating their state.
Object.assign(window,{fcucV08PathRewards,fcucV08RenderPath,fcucV08AutoSubs});
})();


/* ============================================================
   FC Ultimate Club v0.9 — Winter & New Year event layer
   ============================================================ */
(function(){
'use strict';
const V09_WINTER_END='2027-01-25', V09_NY_START='2026-12-10', V09_NY_END='2027-01-05';
const v09Date=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};
const v09Monday=()=>{const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()-((d.getDay()+6)%7));return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};
const v09Test=()=>!!state.newYearTestMode;
const v09NYActive=()=>v09Date()>=V09_NY_START&&v09Date()<=V09_NY_END;
const v09NYUnlock=()=>v09Date()>=V09_NY_START;
const v09NYExpired=()=>v09Date()>V09_NY_END;
const v09CardDefs=[
 {name:'Aleksey Batrakov',id:'ny_evt_batrakov_74',pos:'CAM',ovr:74,age:21,nation:'Россия',club:'Galatasaray',type:'event',event:'newyear',price:0,stats:{PAC:75,SHO:72,PAS:79,DRI:80,DEF:57,PHY:67}},
 {name:'David de Gea',id:'ny_evt_degea_76',pos:'GK',ovr:76,age:36,nation:'Испания',club:'Fiorentina',type:'event',event:'newyear',price:0,stats:{PAC:55,SHO:45,PAS:70,DRI:68,DEF:78,PHY:73}},
 {name:'Hugo Ekitiké',id:'ny_evt_ekitike_80',pos:'ST',ovr:80,age:24,nation:'Франция / Камерун',club:'Liverpool',type:'event',event:'newyear',price:0,stats:{PAC:84,SHO:82,PAS:74,DRI:83,DEF:39,PHY:79}}
];
// Inject the New Year event cards into the runtime event database, but keep them
// out of the regular Winter token market.
for(const c of v09CardDefs){if(!FCUC_EVENT_DB.some(p=>p.id===c.id))FCUC_EVENT_DB.push({...c});}
const bat=FCUC_PLAYER_DB.find(p=>fcucNameKey(p.name)==='aleksey batrakov');
if(bat){bat.ovr=78;bat.pos='CAM';bat.club='Galatasaray';bat.price=1050000;bat.value=32;bat.stats={PAC:78,SHO:76,PAS:83,DRI:82,DEF:60,PHY:70};}
const batMarket=(state.market||[]).find(p=>fcucNameKey(p.name)==='aleksey batrakov');
if(batMarket){batMarket.ovr=78;batMarket.club='Galatasaray';batMarket.price=1050000;}
// Ensure persisted players in older careers use the upgraded base rating.
for(const p of state.players||[])if(fcucNameKey(p.name)==='aleksey batrakov'&&p.id==='db_0397'){p.ovr=78;p.club='Galatasaray';}
state.newYearTokens=Number(state.newYearTokens)||0;
state.newYearGiftClaims=Array.isArray(state.newYearGiftClaims)?state.newYearGiftClaims:[];
state.newYearWeekKey=state.newYearWeekKey||v09Monday();
state.newYearWeekProgress=state.newYearWeekProgress||{matches:0,goals:0,wins:0};
state.newYearWeekClaimed=!!state.newYearWeekClaimed;
state.winterGuaranteedClaims=Array.isArray(state.winterGuaranteedClaims)?state.winterGuaranteedClaims:[];

// Remove New Year-only cards from the ordinary Winter market.
const v09RenderEventBase=renderEventMarket;
renderEventMarket=function(){
 const box=$('#eventPlayerMarket');if(!box)return;
 const available=FCUC_EVENT_DB.filter(p=>p.event!=='newyear'&&!fcucOwned(p.name));
 box.innerHTML=available.slice(0,34).map(p=>{const cost=60+Math.max(0,p.ovr-69)*10;return `<article class="market-card event-market-card"><div class="card-art winter-card"><b>${p.ovr}</b><small>${p.pos} · WINTER</small></div><div class="card-info"><b>${fcucSafeText(p.name)}</b><small>${fcucSafeText(p.club)} · ${p.age||'—'} лет</small><div class="price-row"><span>❄ ${cost} жетонов</span><button data-event-buy="${p.id}" data-cost="${cost}">ПОЛУЧИТЬ</button></div></div></article>`;}).join('')||'<p class="muted">Все доступные карточки события уже собраны.</p>';
};

// Winter milestone path: three reliable cards, with two optional extra cards.
const v09WinterMilestones=[
 {points:250,ovr:[68,74],label:'Первый зимний талант'},
 {points:800,ovr:[69,76],label:'Второй зимний талант'},
 {points:1500,ovr:[70,77],label:'Третий зимний талант'},
 {points:2700,ovr:[74,80],label:'Бонусная зимняя карточка'},
 {points:4000,ovr:[76,82],label:'Финальная зимняя карточка'}
];
// The older Winter Path player rewards become event tokens, keeping the
// guaranteed Winter player range at 3–5 when the optional branch reward is earned.
if(typeof fcucV08PathRewards!=='undefined'){fcucV08PathRewards[3]={label:'Жетоны события',detail:'45 жетонов события',unlock:500,type:'tokens',amount:45};fcucV08PathRewards[4]={label:'Жетоны события',detail:'60 жетонов события',unlock:1000,type:'tokens',amount:60};}
function v09WinterRender(){const box=$('#winterGuaranteeTrack');if(!box)return;const pts=Number(state.eventPoints)||0;box.innerHTML=v09WinterMilestones.map((m,i)=>{const claimed=state.winterGuaranteedClaims.includes(i),open=pts>=m.points;return `<article class="winter-guarantee-card ${claimed?'claimed':open?'':'locked'}"><small>${i<3?'ГАРАНТИРОВАНО':'БОНУС'}</small><strong>${m.ovr[0]}–${m.ovr[1]}</strong><b>${m.label}</b><small>${m.points} очков события</small><button class="claim" data-winter-milestone="${i}" ${claimed||!open?'disabled':''}>${claimed?'ПОЛУЧЕНО':open?'ЗАБРАТЬ':'ЗАКРЫТО'}</button></article>`;}).join('');}
document.addEventListener('click',e=>{const b=e.target.closest('[data-winter-milestone]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();const i=Number(b.dataset.winterMilestone),m=v09WinterMilestones[i];if(!m||state.winterGuaranteedClaims.includes(i)||(Number(state.eventPoints)||0)<m.points)return;let pool=FCUC_EVENT_DB.filter(p=>p.event!=='newyear'&&!fcucOwned(p.name)&&Number(p.ovr)>=m.ovr[0]&&Number(p.ovr)<=m.ovr[1]);if(!pool.length)pool=FCUC_EVENT_DB.filter(p=>p.event!=='newyear'&&!fcucOwned(p.name)&&Number(p.ovr)>=m.ovr[0]);if(!pool.length){toast('Все карточки этого диапазона уже собраны.');return;}const p=pool[Math.floor(Math.random()*pool.length)];if(!fcucAddToClub(p,'winter-path'))return;state.winterGuaranteedClaims.push(i);save();v09WinterRender();modal('ЗИМНИЙ ИГРОК ПОЛУЧЕН',`${p.name} · ${p.ovr} OVR. Карточка добавлена в клуб.`,fcucCardHTML(p));},true);

// New Year weekly objectives: reset on Monday and award three event tokens once
// all three football tasks are complete.
function v09RefreshNYWeek(){const key=v09Monday();if(state.newYearWeekKey!==key){state.newYearWeekKey=key;state.newYearWeekProgress={matches:0,goals:0,wins:0};state.newYearWeekClaimed=false;save();return true;}return false;}
const v09NYQuests=[
 {key:'matches',title:'Календарь праздников',desc:'Заверши 3 матча',goal:3},
 {key:'goals',title:'Голевая гирлянда',desc:'Забей 5 голов',goal:5},
 {key:'wins',title:'Победный Новый год',desc:'Выиграй 2 матча',goal:2}
];
const v09AddStatBase=addStat;
addStat=function(key,n=1){v09AddStatBase(key,n);if(v09NYActive()&&key==='goals'){v09RefreshNYWeek();state.newYearWeekProgress.goals=(Number(state.newYearWeekProgress.goals)||0)+n;save();v09RenderNY();}};
const v09FinishBase=finishMatch;
finishMatch=function(){const was=!!match?.active,won=was&&match.home>match.away;v09FinishBase();if(was&&v09NYActive()){v09RefreshNYWeek();state.newYearWeekProgress.matches=(Number(state.newYearWeekProgress.matches)||0)+1;if(won)state.newYearWeekProgress.wins=(Number(state.newYearWeekProgress.wins)||0)+1;save();v09RenderNY();}};
function v09RenderNY(){
 const bal=$('#newYearTokenBalance');if(bal)bal.textContent=fmt(state.newYearTokens||0);
 const lock=$('#newYearLockLabel');if(lock)lock.textContent=v09NYUnlock()?'СОБЫТИЕ ДОСТУПНО':'ОТКРОЕТСЯ 10.12.2026';
 const open=$('#openNewYear');if(open){open.disabled=!v09NYUnlock()||v09NYExpired();open.textContent=v09NYExpired()?'СОБЫТИЕ ЗАВЕРШЕНО':v09NYUnlock()?'ОТКРЫТЬ NEW YEAR':'СКОРО ОТКРЫТИЕ';}
 const cards=$('#newYearCardsPreview');if(cards)cards.innerHTML=v09CardDefs.map(c=>`<article class="newyear-card"><small>${c.club.toUpperCase()} · NEW YEAR</small><b>${c.ovr}</b><strong>${c.name}</strong><small>${c.pos} · EVENT CARD</small></article>`).join('');
 const giftBox=$('#newYearGiftTimeline');if(giftBox){const gifts=[
  {id:'batrakov',date:'21 ДЕКАБРЯ',key:'2026-12-21',title:'25 000 монет',desc:'Праздничная награда клуба',icon:'🎁'},
  {id:'degea',date:'31 ДЕКАБРЯ',key:'2026-12-31',title:'50 самоцветов',desc:'Праздничная награда клуба',icon:'🎁'},
  {id:'jan1',date:'1 ЯНВАРЯ',key:'2027-01-01',title:'Большой новогодний подарок',desc:'150 000 монет или 100 зимних жетонов',icon:'🎁'}
 ];giftBox.innerHTML=gifts.map(g=>{const claimed=state.newYearGiftClaims.includes(g.id),unlocked=v09Date()>=g.key;return `<article class="newyear-gift ${claimed?'claimed':unlocked?'':'locked'}"><div class="newyear-gift-box">${g.icon}</div><div><div class="newyear-gift-date">${g.date}</div><b>${g.title}</b><p class="muted">${g.desc}</p></div><button class="${claimed?'outline':'primary'}" data-ny-gift="${g.id}" ${claimed||!unlocked?'disabled':''}>${claimed?'ПОЛУЧЕНО':unlocked?'🎁 ОТКРЫТЬ':'ЗАКРЫТО'}</button></article>`;}).join('');}
 const weekly=$('#newYearWeekly');if(weekly){v09RefreshNYWeek();const prog=state.newYearWeekProgress||{};const done=v09NYQuests.filter(q=>(Number(prog[q.key])||0)>=q.goal).length;weekly.innerHTML=v09NYQuests.map(q=>{const n=Math.min(q.goal,Number(prog[q.key])||0),ok=n>=q.goal;return `<article class="quest"><div class="quest-icon">⚽</div><div class="quest-info"><b>${q.title}</b><small>${q.desc} · ${n}/${q.goal}</small><div class="bar"><i style="width:${n/q.goal*100}%"></i></div></div><div class="quest-reward">🎟 +1 жетон</div><span>${ok?'ГОТОВО':'В ПРОЦЕССЕ'}</span></article>`;}).join('')+`<div class="weekly-bonus"><b>Награда за все 3 задания: 3 жетона New Year</b><button class="primary" id="claimNewYearWeek" ${done<3||state.newYearWeekClaimed?'disabled':''}>${state.newYearWeekClaimed?'ПОЛУЧЕНО':'ЗАБРАТЬ 3 ЖЕТОНА'}</button></div>`;const label=$('#newYearWeekLabel');if(label)label.textContent=`НЕДЕЛЯ С ${state.newYearWeekKey}`;}
}

document.addEventListener('click',e=>{
 const gift=e.target.closest('[data-ny-gift]');if(gift){e.preventDefault();e.stopImmediatePropagation();const id=gift.dataset.nyGift;if(!Array.isArray(state.newYearGiftClaims))state.newYearGiftClaims=[];if(state.newYearGiftClaims.includes(id))return;const keys={batrakov:'2026-12-21',degea:'2026-12-31',jan1:'2027-01-01'};if(v09Date()<keys[id]){toast('Этот подарок пока закрыт.');return;}let result='';
  if(id==='batrakov'){state.coins+=25000;result='25 000 монет!';}
  else if(id==='degea'){state.gems+=50;result='50 самоцветов!';}
  else{if(Math.random()<.65){state.coins+=150000;result='150 000 монет!';}else{state.winterGems=(Number(state.winterGems)||0)+100;state.eventCoins=state.winterGems;result='100 зимних самоцветов!';}}
  state.newYearGiftClaims.push(id);save();updateWallet();v09RenderNY();renderAll();modal('НОВОГОДНИЙ ПОДАРОК ОТКРЫТ',result);return;
 }
 if(e.target.closest('#claimNewYearWeek')){e.preventDefault();e.stopImmediatePropagation();v09RefreshNYWeek();const p=state.newYearWeekProgress||{};if(!v09NYQuests.every(q=>(Number(p[q.key])||0)>=q.goal)||state.newYearWeekClaimed)return;state.newYearWeekClaimed=true;state.newYearTokens+=3;save();v09RenderNY();toast('Получено 3 жетона New Year!');return;}
 if(e.target.closest('#newYearPlayerPack')){e.preventDefault();e.stopImmediatePropagation();if(state.newYearTokens<3){toast('Нужно 3 жетона New Year.');return;}const candidates=FCUC_PLAYER_DB.filter(p=>Number(p.ovr)>=60&&!fcucOwned(p.name));if(!candidates.length){toast('В базе не осталось новых игроков 60+.');return;}const weighted=[];for(const p of candidates){const w=p.ovr>=85?1:p.ovr>=80?3:p.ovr>=75?7:p.ovr>=70?16:30;for(let i=0;i<w;i++)weighted.push(p);}const p=weighted[Math.floor(Math.random()*weighted.length)];state.newYearTokens-=3;const added=fcucAddToClub(p,'newyear-pack');if(!added){state.newYearTokens+=3;return;}state.stats.packs=(state.stats.packs||0)+1;save();updateWallet();v09RenderNY();modal('НОВОГОДНИЙ НАБОР',`${p.name} · ${p.ovr} OVR. Рейтинг 60+; чем выше рейтинг, тем реже выпадение.`,fcucCardHTML(p));return;}
 if(e.target.closest('#newYearCoinsReward')){e.preventDefault();e.stopImmediatePropagation();if(state.newYearTokens<6){toast('Нужно накопить 6 жетонов New Year.');return;}state.newYearTokens-=6;state.coins+=300000;save();updateWallet();v09RenderNY();modal('ГАРАНТИРОВАННАЯ НАГРАДА','Получено 300 000 монет за 6 жетонов New Year.');return;}
},true);

// Entering the New Year page temporarily applies its red/green holiday skin.
const v09NavigateBase=navigate;
navigate=function(page){if(page!=='newyear')document.body.classList.remove('newyear-theme');v09NavigateBase(page);if(page==='newyear'){if(!v09NYUnlock()||v09NYExpired()){toast('New Year Event откроется 10 декабря 2026 года.');v09NavigateBase('event');return;}document.body.classList.add('newyear-theme');v09RenderNY();}};
$('#openNewYear')?.addEventListener('click',()=>{if(!v09NYUnlock()||v09NYExpired()){toast('Событие откроется 10 декабря 2026 года.');return;}navigate('newyear');});
$('#backToWinter')?.addEventListener('click',()=>navigate('event'));

// Match simulation is removed. The live match clock runs at 1X or 3X only.
let v09Speed=1;
function v09SetSpeed(){if(!match?.active)return;clearInterval(match.timer);match.timer=setInterval(matchTick,Math.round(650/v09Speed));const b=$('#matchSpeed');if(b)b.textContent=`СКОРОСТЬ: ${v09Speed}X`;}
const v09StartBase=startMatch;
startMatch=function(){if(match?.active)return;v09Speed=1;v09StartBase();if(match?.active)v09SetSpeed();const b=$('#matchSpeed');if(b)b.textContent='СКОРОСТЬ: 1X';};
$('#matchSpeed')?.addEventListener('click',()=>{v09Speed=v09Speed===1?3:1;if(match?.active)v09SetSpeed();else{$('#matchSpeed').textContent=`СКОРОСТЬ: ${v09Speed}X`;}toast(v09Speed===3?'Ускорение матча 3X':'Обычная скорость 1X');});
// Old legacy controls cannot fast-forward or manually end a match anymore.
$('#matchSkip')?.remove();$('#matchEnd')?.remove();

// Higher ratings are rarer in normal packs; the database remains intact.
fcucOpenPack=function(cost,type){if(state.gems<cost){toast('Недостаточно обычных самоцветов');return;}const ranges={standard:[40,70],starter:[40,70],gold:[55,82],premium:[55,82],elite:[70,93]};const [min,max]=ranges[type]||ranges.standard;const candidates=FCUC_PLAYER_DB.filter(p=>p.ovr>=min&&p.ovr<=max&&!fcucOwned(p.name));if(!candidates.length){toast('В этом диапазоне больше нет новых игроков');return;}const weighted=[];for(const p of candidates){const w=p.ovr>=90?1:p.ovr>=85?2:p.ovr>=80?5:p.ovr>=75?10:p.ovr>=70?18:30;for(let i=0;i<w;i++)weighted.push(p);}const p=weighted[Math.floor(Math.random()*weighted.length)];state.gems-=cost;addStat('packs');const added=fcucAddPlayerToPool(p);if(!added){toast('Игрок уже есть в клубе — попробуй ещё раз');return;}if(typeof fcucV06AddXP==='function')fcucV06AddXP(10,'набор');const owned=state.players[state.players.length-1];modal('ИГРОК ПОЛУЧЕН!',`${owned.name} · ${owned.pos} · рейтинг ${owned.ovr}. Высокие рейтинги теперь встречаются заметно реже.`,fcucCardHTML(owned));save();updateWallet();};

// New Year state is also refreshed on app return and periodic quest refresh.
const v09RefreshBase=fcucV07RefreshCycles;
fcucV07RefreshCycles=function(){const oldWeek=state.weekStart;v09RefreshBase();const nyChanged=v09RefreshNYWeek();if(oldWeek!==state.weekStart){renderAll();renderDaily();renderBranch();}if(nyChanged)v09RenderNY();};
setInterval(()=>{v09RefreshNYWeek();v09RenderNY();v09WinterRender();},30000);
// Winter event end date is visible in its banner.
const winterBanner=$('#event .event-banner');if(winterBanner){const p=winterBanner.querySelector('p');if(p)p.textContent='Играй зимние матчи, выполняй испытания и собирай ледяные карточки 69–82 OVR. Событие действует до 25 января 2027 года.';}
const winterEyebrow=$('#event .event-banner small');if(winterEyebrow)winterEyebrow.textContent='ГЛАВНОЕ СОБЫТИЕ · ДО 25.01.2027';
// Update rendering hooks after all v0.8 render functions are in place.
const v09RenderEventModeBase=renderEventMode;
renderEventMode=function(){v09RenderEventModeBase();v09WinterRender();};
const v09UpdateWalletBase=updateWallet;
updateWallet=function(){v09UpdateWalletBase();const b=$('#newYearTokenBalance');if(b)b.textContent=fmt(state.newYearTokens||0);};
v09RefreshNYWeek();v09WinterRender();v09RenderNY();

/* ============================================================
   FC Ultimate Club v0.9.1 HOTFIX
   Reliable store packs, 1X/3X live match clock, substitutions,
   final whistle and weekly Winter Path reward rotation.
   ============================================================ */
// Starter gems: the previous new-career grant (10) was below the cheapest
// store pack price (15), making every pack appear unusable on a fresh career.
if(!state.packStarterGrantClaimed){state.gems=Math.max(60,Number(state.gems)||0);state.packStarterGrantClaimed=true;save();updateWallet();}

// Store packs always use the correct database and the correct currency.
fcucOpenPack=function(cost,type='standard'){
 cost=Math.max(0,Number(cost)||0);
 if(Number(state.gems||0)<cost){toast(`Недостаточно самоцветов: нужно ${cost}, у тебя ${Number(state.gems)||0}.`);return;}
 const ranges={standard:[40,70],starter:[40,72],gold:[55,85],premium:[60,88],elite:[70,93]};
 const [min,max]=ranges[type]||ranges.standard;
 let candidates=FCUC_PLAYER_DB.filter(p=>Number(p.ovr)>=min&&Number(p.ovr)<=max&&!fcucOwned(p.name));
 if(!candidates.length)candidates=FCUC_PLAYER_DB.filter(p=>Number(p.ovr)>=min&&Number(p.ovr)<=max);
 if(!candidates.length){toast('В базе пока нет игроков для этого набора.');return;}
 const weighted=[];
 for(const p of candidates){const rating=Number(p.ovr)||50;const weight=rating>=90?1:rating>=85?2:rating>=80?4:rating>=75?8:rating>=70?16:28;for(let i=0;i<weight;i++)weighted.push(p);}
 const chosen=weighted[Math.floor(Math.random()*weighted.length)];
 // Duplicate cards are allowed only when every player in the pack's rating
 // band is already owned.
 state.gems-=cost;
 const added=fcucAddPlayerToPool(chosen);
 if(!added){state.gems+=cost;toast('Не удалось добавить карточку. Попробуй ещё раз.');return;}
 state.stats=state.stats||{};state.stats.packs=(Number(state.stats.packs)||0)+1;
 state.weeklyProgress=state.weeklyProgress||{};state.weeklyProgress.packs=(Number(state.weeklyProgress.packs)||0)+1;
 if(typeof fcucV06AddXP==='function')fcucV06AddXP(10,'открытие набора');
 save();updateWallet();renderAll();drawSquad();renderReserve?.();
 const owned=state.players[state.players.length-1];
 modal('НАБОР ОТКРЫТ!',`${owned.name} · ${owned.pos} · ${owned.ovr} OVR. Карточка добавлена в клуб.`,fcucCardHTML(owned));
};

// Replace the live match clock with one authoritative timer. No instant
// simulation/skip button: every match runs to 90 minutes at 1X or 3X.
let v091Speed=1;
function v091SetSpeed(next){
 v091Speed=next===3?3:1;
 const btn=$('#matchSpeed');if(btn)btn.textContent=`СКОРОСТЬ: ${v091Speed}X`;
 if(match?.active){clearInterval(match.timer);match.timer=setInterval(matchTick,Math.round(650/v091Speed));}
}
function v091RenderClock(){
 renderMatchSetup();
 const bar=$('#matchTimeline');if(bar)bar.style.width=`${Math.min(100,match.minute/90*100)}%`;
 const score=$('#score');if(score)score.textContent=match.active?'МАТЧ ИДЁТ':match._finished?'ФИНАЛЬНЫЙ СВИСТОК':'МАТЧ ГОТОВ';
}
function v091FinishMatch(){
 if(!match?.active||match._finished||match._finishing)return;
 match._finishing=true;clearInterval(match.timer);match.timer=null;
 const won=match.home>match.away,draw=match.home===match.away;
 match.active=false;match._finished=true;match.minute=match._finalMinute||90;
 state.coins=(Number(state.coins)||0)+(won?50000:10000);
 state.stats=state.stats||{};state.stats.matches=(Number(state.stats.matches)||0)+1;
 state.stats.wins=(Number(state.stats.wins)||0)+(won?1:0);
 state.weeklyProgress=state.weeklyProgress||{};state.weeklyProgress.matches=(Number(state.weeklyProgress.matches)||0)+1;
 state.weeklyProgress.wins=(Number(state.weeklyProgress.wins)||0)+(won?1:0);
 state.eventProgress=state.eventProgress||{};state.eventProgress.matches=(Number(state.eventProgress.matches)||0)+1;
 state.eventProgress.wins=(Number(state.eventProgress.wins)||0)+(won?1:0);
 state.dailyProgress=state.dailyProgress||{};state.dailyProgress.matches=(Number(state.dailyProgress.matches)||0)+1;
 state.dailyProgress.wins=(Number(state.dailyProgress.wins)||0)+(won?1:0);
 state.branchProgress=state.branchProgress||{};state.branchProgress.matches=(Number(state.branchProgress.matches)||0)+1;
 state.branchProgress.wins=(Number(state.branchProgress.wins)||0)+(won?1:0);
 state.seasonXP=(Number(state.seasonXP)||0)+50;
 state.eventPoints=(Number(state.eventPoints)||0)+50;
 state.weeklyProgress.eventPoints=(Number(state.weeklyProgress.eventPoints)||0)+50;
 state.clubLevel=1+Math.floor((Number(state.seasonXP)||0)/500);
 state.history=state.history||[];
 state.history.unshift({date:new Date().toLocaleDateString('ru-RU'),score:`${match.home} — ${match.away}`,result:won?'Победа':draw?'Ничья':'Поражение'});
 state.history=state.history.slice(0,12);
 if(v09NYActive()){
  v09RefreshNYWeek();state.newYearWeekProgress=state.newYearWeekProgress||{matches:0,goals:0,wins:0};
  state.newYearWeekProgress.matches=(Number(state.newYearWeekProgress.matches)||0)+1;
  if(won)state.newYearWeekProgress.wins=(Number(state.newYearWeekProgress.wins)||0)+1;
  v09RenderNY();
 }
 match._finishing=false;matchLog('Финальный свисток.');
 $('#matchStart')?.removeAttribute('disabled');
 const speed=$('#matchSpeed');if(speed)speed.textContent='СКОРОСТЬ: 1X';
 v091Speed=1;v091RenderClock();save();updateWallet();renderAll();renderDaily?.();renderBranch?.();renderEventMode?.();v09WinterRender();
 modal(won?'ПОБЕДА! +50 000':draw?'НИЧЬЯ · МАТЧ ЗАВЕРШЁН':'МАТЧ ЗАВЕРШЁН',`${state.club?.name||'Frost United'} ${match.home} — ${match.away} Thunder FC. ${won?'Начислено 50 000 монет.':'Начислено 10 000 монет за матч.'}`);
}
finishMatch=v091FinishMatch;
matchTick=function(){
 if(!match?.active||match._finished)return;
 match.minute=Math.min(90,(Number(match.minute)||0)+1);
 const ids=(state.startingXI||[]).slice(0,11);
 const avg=ids.reduce((n,id)=>n+(Number(playerById(id)?.ovr)||50),0)/Math.max(1,ids.length);
 const attack=match.style==='Атака'?.004:match.style==='Оборона'?-.003:0;
 const homeChance=Math.max(.006,Math.min(.035,(.014+(avg-65)*.00035+attack)));
 const awayChance=.014;
 const r=Math.random();
 if(r<homeChance){match.home++;addStat('goals');matchLog('ГОЛ! '+(state.club?.name||'Frost United')+' забивает!');state.seasonXP=(Number(state.seasonXP)||0)+8;state.eventPoints=(Number(state.eventPoints)||0)+8;state.weeklyProgress.eventPoints=(Number(state.weeklyProgress.eventPoints)||0)+8;}
 else if(r<homeChance+awayChance){match.away++;matchLog('Соперник забивает гол.');}
 else if(match.minute%7===0)matchLog(['Опасная атака хозяев','Удар — вратарь спасает','Подача с фланга','Перехват в центре поля','Стандарт у ворот соперника'][Math.floor(Math.random()*5)]);
 v091RenderClock();save();
 if(match.minute>=90)finishMatch();
};
startMatch=function(){
 if(match?.active)return;
 match={active:true,minute:0,home:0,away:0,subs:0,log:[],timer:null,style:state.style,formation:state.formation,_finished:false,_finishing:false};
 $('#matchStart')?.setAttribute('disabled','disabled');
 matchLog('Матч начался. Свисток арбитра!');v091RenderClock();
 v091SetSpeed(v091Speed||1);
 toast(`Матч начался · скорость ${v091Speed}X`);
};
// Rating-based substitutions are limited by the five-substitution match rule.
fcucV08AutoSubs=function(){
 if(!match?.active){toast('Начни матч — тогда можно выполнить автозамены.');return;}
 const remaining=Math.max(0,5-(Number(match.subs)||0));let made=0;
 while(made<remaining){let best=null,bestGain=0;
  for(let bi=0;bi<(state.bench||[]).length;bi++)for(let si=0;si<(state.startingXI||[]).length;si++){
   const sub=playerById(state.bench[bi]),starter=playerById(state.startingXI[si]);
   const gain=fcucV07EffectiveOVR(sub,si)-fcucV07EffectiveOVR(starter,si);
   if(gain>bestGain){bestGain=gain;best={bi,si};}
  }
  if(!best)break;
  const out=state.startingXI[best.si],incoming=state.bench[best.bi];
  state.startingXI[best.si]=incoming;state.bench[best.bi]=out;
  match.subs=(Number(match.subs)||0)+1;made++;
 }
 save();drawSquad();renderReserve?.();updateOverall?.();
 if(made)matchLog(`Автозамены по рейтингу: ${made}. Использовано ${match.subs}/5.`);
 toast(made?`Автозамен выполнено: ${made} · осталось ${5-match.subs}`:'На скамейке нет игроков сильнее подходящих игроков основы.');
};

window.fcucV091AutoSubs=function(){
 if(!match?.active){toast('Начни матч — тогда можно выполнить автозамены.');return;}
 const remaining=Math.max(0,5-(Number(match.subs)||0));let made=0;
 while(made<remaining){let best=null,bestGain=0;
  for(let bi=0;bi<(state.bench||[]).length;bi++)for(let si=0;si<(state.startingXI||[]).length;si++){
   const sub=playerById(state.bench[bi]),starter=playerById(state.startingXI[si]);
   const gain=fcucV07EffectiveOVR(sub,si)-fcucV07EffectiveOVR(starter,si);
   if(gain>bestGain){bestGain=gain;best={bi,si};}
  }
  if(!best)break;
  const out=state.startingXI[best.si],incoming=state.bench[best.bi];
  state.startingXI[best.si]=incoming;state.bench[best.bi]=out;
  match.subs=(Number(match.subs)||0)+1;made++;
 }
 save();drawSquad();renderReserve?.();updateOverall?.();
 if(made)matchLog(`Автозамены по рейтингу: ${made}. Использовано ${match.subs}/5.`);
 toast(made?`Автозамен выполнено: ${made} · осталось ${5-match.subs}`:'На скамейке нет игроков сильнее подходящих игроков основы.');
};

// Start and speed listeners are delegated so that they remain valid after
// navigation/rendering and cannot be shadowed by legacy inline handlers.
document.addEventListener('click',e=>{
 const speed=e.target.closest('#matchSpeed');if(speed){e.preventDefault();e.stopImmediatePropagation();v091SetSpeed(v091Speed===1?3:1);toast(v091Speed===3?'Ускорение матча 3X':'Обычная скорость 1X');return;}
 const start=e.target.closest('#matchStart');if(start){e.preventDefault();e.stopImmediatePropagation();startMatch();return;}
},true);
// Remove any legacy instant-simulation and manual-finish controls.
$('#matchSkip')?.remove();$('#matchEnd')?.remove();

// Weekly Winter Path: new reward lineup and fresh claims every Monday.
const v091WinterPathSets=[
 [
  {label:'10 жетонов события',kind:'tokens',amount:10,unlock:0},{label:'15 зимних самоцветов',kind:'winter',amount:15,unlock:0},{label:'15 000 монет',kind:'coins',amount:15000,unlock:150},{label:'25 жетонов события',kind:'tokens',amount:25,unlock:350},{label:'30 зимних самоцветов',kind:'winter',amount:30,unlock:650}
 ],
 [
  {label:'12 зимних самоцветов',kind:'winter',amount:12,unlock:0},{label:'15 жетонов события',kind:'tokens',amount:15,unlock:0},{label:'20 000 монет',kind:'coins',amount:20000,unlock:150},{label:'30 жетонов события',kind:'tokens',amount:30,unlock:350},{label:'35 зимних самоцветов',kind:'winter',amount:35,unlock:650}
 ],
 [
  {label:'15 жетонов события',kind:'tokens',amount:15,unlock:0},{label:'20 зимних самоцветов',kind:'winter',amount:20,unlock:0},{label:'25 000 монет',kind:'coins',amount:25000,unlock:150},{label:'35 жетонов события',kind:'tokens',amount:35,unlock:350},{label:'40 зимних самоцветов',kind:'winter',amount:40,unlock:650}
 ],
 [
  {label:'18 зимних самоцветов',kind:'winter',amount:18,unlock:0},{label:'18 жетонов события',kind:'tokens',amount:18,unlock:0},{label:'30 000 монет',kind:'coins',amount:30000,unlock:150},{label:'40 жетонов события',kind:'tokens',amount:40,unlock:350},{label:'45 зимних самоцветов',kind:'winter',amount:45,unlock:650}
 ]
];
function v091RefreshWinterWeek(){
 const key=v09Monday();
 if(state.winterPathWeekKey!==key){state.winterPathWeekKey=key;state.winterPathClaimed=[];save();return true;}
 if(!Array.isArray(state.winterPathClaimed))state.winterPathClaimed=[];
 return false;
}
function v091WinterRewards(){const week=Math.floor(Date.UTC(...v09Monday().split('-').map((v,i)=>i===1?Number(v)-1:Number(v)))/604800000);return v091WinterPathSets[((week%v091WinterPathSets.length)+v091WinterPathSets.length)%v091WinterPathSets.length];}
fcucV08RenderPath=function(){
 const box=$('#eventPathRewards');if(!box)return;
 v091RefreshWinterWeek();const rewards=v091WinterRewards();const pts=Number(state.weeklyProgress?.eventPoints)||0;
 box.innerHTML=rewards.map((r,i)=>{const claimed=state.winterPathClaimed.includes(i),open=i<2||pts>=r.unlock;return `<article class="reward ${claimed?'done':open?'current':'locked'}"><small>${i+1}</small><b>${r.unlock?`${r.unlock} ОЧКОВ НЕДЕЛИ`:'ОТКРЫТО'}</b><span>${r.label}</span><button class="claim" data-winter-week-path="${i}" ${claimed||!open?'disabled':''}>${claimed?'ПОЛУЧЕНО':open?'ЗАБРАТЬ':'ЗАКРЫТО'}</button></article>`;}).join('');
 const head=box.previousElementSibling;const label=head?.querySelector('span');if(label)label.textContent=`НОВАЯ НЕДЕЛЯ · ${state.winterPathWeekKey}`;
};
document.addEventListener('click',e=>{
 const b=e.target.closest('[data-winter-week-path]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();
 v091RefreshWinterWeek();const i=Number(b.dataset.winterWeekPath),r=v091WinterRewards()[i],pts=Number(state.weeklyProgress?.eventPoints)||0;
 if(!r||state.winterPathClaimed.includes(i)||(i>=2&&pts<r.unlock))return;
 if(r.kind==='tokens')state.eventTokens=(Number(state.eventTokens)||0)+r.amount;
 else if(r.kind==='winter'){state.winterGems=(Number(state.winterGems)||0)+r.amount;state.eventCoins=state.winterGems;}
 else if(r.kind==='coins')state.coins=(Number(state.coins)||0)+r.amount;
 state.winterPathClaimed.push(i);save();updateWallet();fcucV08RenderPath();renderEventMode();drawSquad();renderReserve?.();toast('Недельная награда Зимнего пути получена!');
},true);
const v091RenderEventModeBase=renderEventMode;
renderEventMode=function(){v091RenderEventModeBase();fcucV08RenderPath();v09WinterRender();};
// Repaint the weekly path after week rollover and when the player returns to the tab.
const v091CycleBase=fcucV07RefreshCycles;
fcucV07RefreshCycles=function(){v091CycleBase();if(v091RefreshWinterWeek())fcucV08RenderPath();};
setInterval(()=>{if(v091RefreshWinterWeek())fcucV08RenderPath();},30000);
fcucV08RenderPath();


/* ================= FC ULTIMATE CLUB 1.0 =================
   Daily tournament hub + animated New Year card reveal. */
const v10ModalBase=modal;
modal=function(title,txt,extra=''){
 if(title==='НОВОГОДНИЙ ПОДАРОК ОТКРЫТ'&&!extra){
  let card=null;
  if(String(txt).includes('Aleksey Batrakov'))card=v09CardDefs.find(p=>p.id==='ny_evt_batrakov_74');
  else if(String(txt).includes('David de Gea'))card=v09CardDefs.find(p=>p.id==='ny_evt_degea_76');
  else if(String(txt).includes('Hugo Ekitiké'))card=v09CardDefs.find(p=>p.id==='ny_evt_ekitike_80');
  if(card)extra=fcucCardHTML(card);
 }
 v10ModalBase(title,txt,extra);
 if(extra&&/reveal-card/.test(extra)){const c=$('#modalExtra .reveal-card');if(c){c.classList.remove('card-fly-in');void c.offsetWidth;c.classList.add('card-fly-in');}}
};
const v10Today=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};
const v10HolidayEra=()=>v10Today()>='2026-12-18'&&v10Today()<='2027-01-05';
const v10EarlyNames=[
 {name:'АЗИАТСКОЕ ТУРНЕ',tag:'ASIA TOUR',teams:['Seoul Tigers','Tokyo United','Bangkok City','Shanghai Stars','Jakarta FC','Osaka Blue']},
 {name:'ЗИМНЕЕ ТУРНЕ',tag:'WINTER TOUR',teams:['Nordic Wolves','Alpine FC','Frostberg','Helsinki North','Riga Athletic','Prague Ice']},
 {name:'КУБОК СЕВЕРНЫХ ЗВЁЗД',tag:'NORTH STAR CUP',teams:['Oslo Aurora','Stockholm IF','Tallinn Wolves','Copenhagen 09','Vilnius Stars','Reykjavik FC']},
 {name:'КУБОК МОЛОДЫХ',tag:'YOUNG TALENTS',teams:['Lisbon Academy','Porto Juniors','Braga Future','Valencia B','Lyon Next','Ajax Youth']}
];
const v10HolidayNames=[
 {name:'НОВОГОДНИЙ КУБОК',tag:'NEW YEAR CUP',teams:['Santa City','North Pole FC','Evergreen United','Red Ribbon SC','Snowflake Town','Midnight Stars']},
 {name:'КУБОК СНЕЖНОЙ КОРОНЫ',tag:'SNOW CROWN',teams:['Ice Crown FC','Winter Palace','Crystal Rangers','Aurora Eleven','Glacier Town','Polar Athletic']},
 {name:'РОЖДЕСТВЕНСКОЕ ТУРНЕ',tag:'HOLIDAY TOUR',teams:['Jingle Town','Candy Cane FC','Golden Bells','Silver Bells','Holiday Athletic','New Dawn FC']},
 {name:'ЗИМНИЙ ЧЕМПИОНСКИЙ КУБОК',tag:'WINTER CHAMPIONS',teams:['Blizzard FC','Frostbite United','Arctic Eleven','White Peak','Snowstorm City','Northern Lights']}
];
const v10Difficulty={
 easy:{label:'ЛЁГКАЯ',factor:-8,early:{kind:'gems',amount:2,label:'2 самоцвета'},holiday:{kind:'gems',amount:4,label:'4 самоцвета'}},
 hard:{label:'СЛОЖНАЯ',factor:5,early:{kind:'coins',amount:15000,label:'15 000 монет'},holiday:{kind:'gems',amount:8,label:'8 самоцветов'}}
};
const v10TournamentDefs=()=>{
 const n=Math.floor((new Date(v10Today()+'T00:00:00').getTime()-new Date('2026-11-23T00:00:00').getTime())/86400000);
 const pool=v10HolidayEra()?v10HolidayNames:v10EarlyNames;
 const defs=[{id:'daily_a',...pool[((n%pool.length)+pool.length)%pool.length],holiday:v10HolidayEra()},
             {id:'daily_b',...pool[(((n+1)%pool.length)+pool.length)%pool.length],holiday:v10HolidayEra()}];
 if(v10HolidayEra())defs.push({id:'daily_c',...pool[(((n+2)%pool.length)+pool.length)%pool.length],holiday:true});
 return defs;
};
const v10EnsureState=()=>{
 const day=v10Today();
 if(!state.tournamentsV10||state.tournamentsV10.dayKey!==day)state.tournamentsV10={dayKey:day,completed:0,entries:{}};
 state.tournamentsV10.entries=state.tournamentsV10.entries||{};
 for(const d of v10TournamentDefs())if(!state.tournamentsV10.entries[d.id])state.tournamentsV10.entries[d.id]={used:0,round:0,cleared:false,difficulty:null,wins:0};
 return state.tournamentsV10;
};
let v10ActiveId=null,v10ActiveDifficulty=null,v10MatchTimer=null,v10MatchSpeed=1,v10TournamentMatch=null;
const v10OpponentFor=(def,round)=>def.teams[round*2]||def.teams[0];
const v10PlayerStrength=()=>{const ids=(state.startingXI||[]).slice(0,11),n=Math.max(1,ids.length),avg=ids.reduce((s,id)=>s+(Number(playerById(id)?.ovr)||50),0)/n,fit=ids.reduce((s,id)=>s+(Number(state.fitness?.[id])||100),0)/n,form=ids.reduce((s,id)=>s+(Number(state.form?.[id])||0),0)/n;return Math.round(avg+(typeof mrV12Chemistry==='function'?(mrV12Chemistry()-50)*.025:0)+(state.tactics?.mentality==='Атака'?1:0)+(state.tactics?.press==='Высокий'?1:0)+((state.tactics?.instructions||[]).length*.25)+(fit-100)*.02+form*.1);};
const v10GetEntry=id=>v10EnsureState().entries[id];
const v10RewardFor=(def,difficulty)=>{
 if(def.holiday&&difficulty==='hard'&&def.id==='daily_b')return {kind:'player',amount:1,label:'Игрок 62+ OVR'};
 if(!def.holiday&&difficulty==='easy'&&def.id==='daily_b')return {kind:'coins',amount:5000,label:'5 000 монет'};
 if(def.holiday&&difficulty==='easy'&&def.id==='daily_c')return {kind:'gems',amount:4,label:'4 самоцвета'};
 return {...v10Difficulty[difficulty][def.holiday?'holiday':'early']};
};
function v10RenderCards(){
 const box=$('#tournamentCards');if(!box)return;const data=v10EnsureState(),defs=v10TournamentDefs();
 $('#tournamentDate').textContent=new Date().toLocaleDateString('ru-RU',{day:'numeric',month:'long',year:'numeric'});
 $('#tournamentDailyProgress').textContent=`${data.completed||0} / 2 ЗАВЕРШЕНО`;
 $('#tournamentSeasonLabel').textContent=v10HolidayEra()?'NEW YEAR TOURNAMENTS':'WINTER TOUR · ДО 17.12';
 const teamRating=$('#tournamentTeamRating');if(teamRating)teamRating.textContent=v10PlayerStrength();
 box.innerHTML=defs.map((d,i)=>{const e=data.entries[d.id],done=e.cleared,locked=(data.completed||0)>=2&&!done,exhausted=(e.used||0)>=3&&!done;
 const re=v10RewardFor(d,'easy'),rh=v10RewardFor(d,'hard');
 return `<article class="tournament-card ${done?'is-cleared':''} ${locked?'is-locked':''}"><div class="tournament-card-top"><small>${d.tag}</small><span>${d.holiday?'🎄 NEW YEAR':'❄ WINTER'}</span></div><div class="tournament-card-art"><b>${i===0?'🏆':'🥇'}</b><small>DAILY CUP · 0${i+1}/0${defs.length}</small></div><h3>${d.name}</h3><p>Три матча до трофея: 1/4 финала → полуфинал → финал.</p><div class="tournament-card-status"><span>ПОПЫТКИ: ${Math.max(0,3-(e.used||0))}/3</span><span>${done?'ПОБЕДИТЕЛЬ':exhausted?'ПОПЫТКИ ЗАКОНЧИЛИСЬ':`ПРОГРЕСС: ${e.round||0}/3`}</span></div><div class="tournament-difficulties"><button class="tournament-difficulty easy" data-tournament-enter="${d.id}" data-difficulty="easy" ${done||locked||exhausted?'disabled':''}><b>ЛЁГКАЯ</b><small>${re.label}</small></button><button class="tournament-difficulty hard" data-tournament-enter="${d.id}" data-difficulty="hard" ${done||locked||exhausted?'disabled':''}><b>СЛОЖНАЯ</b><small>${rh.label}</small></button></div>${done?'<div class="tournament-won">🏆 ТУРНИР ВЫИГРАН</div>':locked?'<div class="tournament-won muted">ДНЕВНОЙ ЛИМИТ ДОСТИГНУТ</div>':''}</article>`;
 }).join('');
}
function v10RenderBracket(){
 const box=$('#tournamentBracket');if(!box)return;
 if(!v10ActiveId){box.innerHTML='<p class="muted">Выбери турнир, чтобы начать путь с 1/4 финала.</p>';$('#tournamentBracketLabel').textContent='ВЫБЕРИ ТУРНИР';return;}
 const def=v10TournamentDefs().find(x=>x.id===v10ActiveId),e=v10GetEntry(v10ActiveId);if(!def||!e)return;
 const rounds=['1/4 ФИНАЛА','ПОЛУФИНАЛ','ФИНАЛ'];
 box.innerHTML=`<div class="bracket-head"><div><small>${def.tag} · ${v10Difficulty[v10ActiveDifficulty||e.difficulty||'easy'].label}</small><b>${def.name}</b></div><span>${e.wins||0}/3 ПОБЕД</span></div><div class="bracket-rounds">${rounds.map((r,i)=>`<div class="bracket-round ${i<e.round?'won':i===e.round?'current':''}"><small>${r}</small><b>${i<e.round?'✓':i===e.round?'▶':'🔒'}</b><span>${i<e.round?'ПРОЙДЕНО':i===e.round?'СЛЕДУЮЩИЙ МАТЧ':'ОЖИДАНИЕ'}</span></div>`).join('')}</div>`;
 $('#tournamentBracketLabel').textContent=e.round>=3?'ТУРНИР ЗАВЕРШЁН':rounds[e.round]||'ФИНАЛ';
}
function v10RenderMatch(){
 const box=$('#tournamentMatchPanel');if(!box)return;const m=v10TournamentMatch;
 if(!m){
  const entry=v10ActiveId?v10GetEntry(v10ActiveId):null;
  const next=entry&&entry.round>0&&!entry.cleared;
  box.innerHTML=`<div class="tournament-match-empty"><div>⚽</div><b>${next?'СЛЕДУЮЩИЙ ЭТАП ОТКРЫТ':'МАТЧ ТУРНИРА'}</b><p>${next?'Ты прошёл предыдущий раунд. Подготовь состав и выходи на следующий матч.':'Матчи идут по минутам. Используй ускорение 3X, чтобы быстрее пройти турнир.'}</p>${next?'<button class="primary" id="tournamentNextMatch">НАЧАТЬ СЛЕДУЮЩИЙ МАТЧ</button>':''}</div>`;return;
 }
 box.innerHTML=`<div class="tournament-match-head"><div><small>${m.roundLabel} · ${m.difficulty==='hard'?'СЛОЖНАЯ':'ЛЁГКАЯ'}</small><h2>${escapeHTML(m.homeName)} <i>VS</i> ${escapeHTML(m.awayName)}</h2></div><span>${m.finished?'МАТЧ ОКОНЧЕН':'LIVE'}</span></div><div class="tournament-score"><b>${m.home}</b><span>${String(m.minute).padStart(2,'0')}'</span><b>${m.away}</b></div><div class="tournament-score-names"><span>${escapeHTML(m.homeName)}</span><span>${escapeHTML(m.awayName)}</span></div><div class="bar"><i style="width:${m.minute/90*100}%"></i></div><div class="tournament-live-log">${(m.log||[]).slice(-5).map(x=>`<div>${escapeHTML(x)}</div>`).join('')}</div><div class="tournament-match-actions">${m.finished?'<button class="primary" id="tournamentContinue">ПРОДОЛЖИТЬ →</button>':`<button class="outline" id="mrTSpeed">СКОРОСТЬ: ${v10MatchSpeed}X</button><span>Состав: ${v10PlayerStrength()} OVR</span>`}</div>`;
}
function v10StopTimer(){if(v10MatchTimer){clearInterval(v10MatchTimer);v10MatchTimer=null;}}
function v10StartEntry(id,difficulty){
 const data=v10EnsureState(),entry=data.entries[id],def=v10TournamentDefs().find(x=>x.id===id);
 if(!entry||!def||entry.cleared||(data.completed||0)>=2||((entry.used||0)>=3&&!entry.inProgress)){toast('Этот турнир сейчас недоступен.');return;}
 if(v10TournamentMatch){toast('Сначала заверши текущий матч турнира.');return;}
 if(entry.inProgress&&entry.difficulty!==difficulty){toast('Сначала заверши попытку на выбранной сложности.');return;}
 if(entry.difficulty!==difficulty){entry.difficulty=difficulty;entry.round=0;entry.wins=0;entry.inProgress=false;}
 if(entry.round===0&&!entry.inProgress)entry.used++;
 entry.inProgress=true;
 v10ActiveId=id;v10ActiveDifficulty=difficulty;save();v10RenderCards();v10RenderBracket();v10StartMatch();
}
function v10StartMatch(){
 v10StopTimer();const def=v10TournamentDefs().find(x=>x.id===v10ActiveId),e=v10GetEntry(v10ActiveId);if(!def||!e)return;
 const round=Math.min(2,e.round||0),roundLabel=['1/4 ФИНАЛА','ПОЛУФИНАЛ','ФИНАЛ'][round],opponent=v10OpponentFor(def,round);
 e.inProgress=true;save();
 const hard=v10ActiveDifficulty==='hard',base=hard?(v10HolidayEra()?74:68):(v10HolidayEra()?58:53);
 const opponentRating=Math.max(42,Math.min(90,base+round*2+(Math.floor(Math.random()*5)-2)));
 v10TournamentMatch={minute:0,home:0,away:0,homeName:state.club?.name||'ТВОЙ КЛУБ',awayName:opponent,round,roundLabel,difficulty:v10ActiveDifficulty,opponentRating,finished:false,log:['Арбитр проверяет готовность команд. Матч начинается!']};
 v10MatchSpeed=1;v10RenderMatch();v10MatchTimer=setInterval(v10MatchTick,420);
}
function v10MatchTick(){
 const m=v10TournamentMatch;if(!m||m.finished)return;m.minute=Math.min(90,m.minute+1);
 const diff=v10PlayerStrength()-m.opponentRating,homeChance=Math.max(.004,Math.min(.04,.013+diff*.00055)),awayChance=Math.max(.005,Math.min(.035,.014-diff*.00025)),r=Math.random();
 if(r<homeChance){m.home++;m.log.push(`ГОЛ! ${m.homeName} выходит вперёд.`);}else if(r<homeChance+awayChance){m.away++;m.log.push(`Гол ${m.awayName}. Счёт меняется.`);}else if(m.minute%12===0)m.log.push(['Опасный момент у ворот соперника.','Удар — вратарь переводит на угловой.','Контратака! Защита успевает вернуться.','Команды борются за центр поля.'][Math.floor(Math.random()*4)]);
 if(m.minute>=90){
  if(m.home===m.away){
   const h=3+Math.floor(Math.random()*3)+(v10PlayerStrength()>=m.opponentRating?1:0);
   const a=3+Math.floor(Math.random()*3)+(v10PlayerStrength()<m.opponentRating?1:0);
   m.penalties=[h,a];m.winner=h===a?(Math.random()<.5?'home':'away'):(h>a?'home':'away');
   m.log.push(`Серия пенальти: ${h} — ${a}.`);
  }else m.winner=m.home>m.away?'home':'away';
  m.finished=true;v10StopTimer();m.log.push('Финальный свисток!');
 }v10RenderMatch();if(m.finished)save();
}
function v10FinishRound(){
 const m=v10TournamentMatch;if(!m||!m.finished)return;const entry=v10GetEntry(v10ActiveId),def=v10TournamentDefs().find(x=>x.id===v10ActiveId);if(!entry||!def)return;
 if(m.winner==='home'||m.home>m.away){
  entry.inProgress=false;entry.round=Math.min(3,(entry.round||0)+1);entry.wins=(entry.wins||0)+1;
  if(entry.round>=3){
   entry.cleared=true;const data=v10EnsureState();data.completed=Math.min(2,(data.completed||0)+1);const reward=v10RewardFor(def,v10ActiveDifficulty);let rewardCard=null;
   if(reward.kind==='gems')state.gems=(Number(state.gems)||0)+reward.amount;
   else if(reward.kind==='coins')state.coins=(Number(state.coins)||0)+reward.amount;
   else if(reward.kind==='player'){
    const candidates=FCUC_PLAYER_DB.filter(p=>Number(p.ovr)>=62&&Number(p.ovr)<=68&&!fcucOwned(p.name));
    if(candidates.length){const p=candidates[Math.floor(Math.random()*candidates.length)];rewardCard=fcucAddToClub(p,'tournament');}
    else state.coins+=20000;
   }
   save();updateWallet();v10RenderCards();v10RenderBracket();modal('🏆 ТУРНИР ВЫИГРАН!',`Ты прошёл ${def.name} на сложности ${v10Difficulty[v10ActiveDifficulty].label}. Награда: ${reward.label}.`,rewardCard?fcucCardHTML(rewardCard):'');
   v10TournamentMatch=null;v10RenderMatch();return;
  }
  save();v10RenderCards();v10RenderBracket();modal('ПОБЕДА В МАТЧЕ!',`${m.homeName} ${m.home} — ${m.away} ${m.awayName}${m.penalties?` (пенальти ${m.penalties[0]} — ${m.penalties[1]})`:''}. Следующий этап открыт.`);
  v10TournamentMatch=null;v10RenderMatch();
 }else{
  entry.round=0;entry.wins=0;entry.inProgress=false;save();v10RenderCards();v10RenderBracket();
  modal('ТУРНИРНЫЙ МАТЧ ПРОИГРАН',`${m.homeName} ${m.home} — ${m.away} ${m.awayName}. Попытка потрачена. Можно начать заново, если остались попытки.`);
  v10TournamentMatch=null;v10RenderMatch();
 }
}
document.addEventListener('click',e=>{
 const enter=e.target.closest('[data-tournament-enter]');
 if(enter){e.preventDefault();e.stopImmediatePropagation();v10StartEntry(enter.dataset.tournamentEnter,enter.dataset.difficulty);return;}
 if(e.target.closest('#mrTSpeed')){e.preventDefault();e.stopImmediatePropagation();v10MatchSpeed=v10MatchSpeed===1?3:1;v10StopTimer();v10MatchTimer=setInterval(v10MatchTick,420/v10MatchSpeed);v10RenderMatch();return;}
 if(e.target.closest('#tournamentContinue')){e.preventDefault();e.stopImmediatePropagation();v10FinishRound();return;}
 if(e.target.closest('#tournamentNextMatch')){e.preventDefault();e.stopImmediatePropagation();v10StartMatch();return;}
},true);
const v10NavigateBase=navigate;
navigate=function(page){v10NavigateBase(page);if(page==='tournaments'){if($('#crumb'))$('#crumb').textContent='ТУРНИРЫ';v10EnsureState();v10RenderCards();v10RenderBracket();v10RenderMatch();}};
v10EnsureState();v10RenderCards();
setInterval(()=>{const before=state.tournamentsV10?.dayKey;v10EnsureState();if(before!==state.tournamentsV10?.dayKey){v10ActiveId=null;v10ActiveDifficulty=null;v10TournamentMatch=null;v10StopTimer();v10RenderCards();v10RenderBracket();v10RenderMatch();}},60000);


/* MR FOOTBALL 27 v1.1 */
let mrPause=false,mrBreak=false,mrExtra=false;
function mrTimer(){clearInterval(match?.timer);if(match?.active&&!mrPause&&!mrBreak)match.timer=setInterval(matchTick,Math.round(650/(v091Speed||1)));else if(match)match.timer=null;}
function mrPauseButton(){let b=$('#matchPause');if(!b){let a=$('#matchStart')?.parentElement;if(a){b=document.createElement('button');b.id='matchPause';b.type='button';b.className='outline';a.insertBefore(b,$('#matchSpeed')?.nextSibling||null);}}if(b){b.disabled=!match?.active;b.textContent=mrBreak?'НАЧАТЬ 2-Й ТАЙМ':mrPause?'ПРОДОЛЖИТЬ':'ПАУЗА';}}
const mrStartOld=startMatch;startMatch=function(){mrPause=false;mrBreak=false;mrExtra=false;mrStartOld();mrPauseButton();};
const mrFinishOld=finishMatch;finishMatch=function(){if(!match?.active||match._finished)return;clearInterval(match.timer);match.timer=null;match._finalMinute=mrExtra?120:90;mrPause=false;mrBreak=false;mrFinishOld();mrPauseButton();};
matchTick=function(){if(!match?.active||match._finished||mrPause||mrBreak)return;let max=mrExtra?120:90;match.minute=Math.min(max,(+match.minute||0)+1);let ids=(state.startingXI||[]).slice(0,11),avg=ids.reduce((n,id)=>n+(+playerById(id)?.ovr||50),0)/Math.max(1,ids.length),att=match.style==='Атака'?.004:match.style==='Оборона'?-.003:0,hc=Math.max(.006,Math.min(.035,.014+(avg-65)*.00035+att)),ac=.014,r=Math.random();if(r<hc){match.home++;addStat('goals');matchLog('ГОЛ! '+(state.club?.name||'MR FOOTBALL 27')+' забивает!');state.seasonXP=(+state.seasonXP||0)+8;state.eventPoints=(+state.eventPoints||0)+8;state.weeklyProgress.eventPoints=(+state.weeklyProgress.eventPoints||0)+8;}else if(r<hc+ac){match.away++;matchLog('Соперник забивает гол.');}else if(match.minute%8===0)matchLog(['Опасная атака!','Удар — вратарь спасает','Подача с фланга','Перехват в центре поля'][Math.floor(Math.random()*4)]);if(match.minute===45&&!mrExtra){mrBreak=true;clearInterval(match.timer);match.timer=null;matchLog('ПЕРЕРЫВ. Можно изменить тактику и состав.');}else if(match.minute===90&&!mrExtra&&match.home===match.away){mrExtra=true;matchLog('Ничья после 90 минут. Дополнительное время до 120-й минуты.');}else if(match.minute>=max){if(mrExtra&&match.home===match.away){let x=3+Math.floor(Math.random()*3),y=3+Math.floor(Math.random()*3);match.penalties=[x,y];matchLog(`Пенальти: ${x} — ${y}.`);if(x===y){if(Math.random()<.5)match.home++;else match.away++;}else if(x>y)match.home++;else match.away++;}match._finalMinute=match.minute;finishMatch();return;}v091RenderClock();let bar=$('#matchTimeline');if(bar)bar.style.width=(match.minute/(mrExtra?120:90)*100)+'%';mrPauseButton();save();};
function mrTogglePause(){if(!match?.active)return;if(mrBreak){mrBreak=false;mrPause=false;matchLog('Начался второй тайм.');mrTimer();}else{mrPause=!mrPause;if(mrPause){clearInterval(match.timer);match.timer=null;}else mrTimer();}mrPauseButton();v091RenderClock();save();}
document.addEventListener('click',e=>{let b=e.target.closest('#matchPause');if(b){e.preventDefault();e.stopImmediatePropagation();mrTogglePause();}},true);
v091SetSpeed=function(n){v091Speed=n===3?3:1;let b=$('#matchSpeed');if(b)b.textContent=`СКОРОСТЬ: ${v091Speed}X`;if(match?.active&&!mrPause&&!mrBreak)mrTimer();};
['#matchFormation','#matchStyle'].forEach(sel=>$(sel)?.addEventListener('change',e=>{if(!match?.active)return;if(sel==='#matchFormation')match.formation=e.target.value;else match.style=e.target.value;matchLog('Изменение тактики: '+e.target.value);save();}));

/* Tournament kickoff is manual; match pause, half-time, extra-time and tactics. */
const mrTRenderBase=v10RenderMatch;
function mrTRender(){const box=$('#tournamentMatchPanel'),m=v10TournamentMatch;if(!box)return;if(!m){mrTRenderBase();return;}let phase=m.finished?'ФИНАЛЬНЫЙ СВИСТОК':m.ready?'ГОТОВ К СТАРТУ':m.halftime?'ПЕРЕРЫВ · 45 МИНУТ':m.paused?'ПАУЗА':'МАТЧ ИДЁТ',max=m.extraTime?120:90;box.innerHTML=`<div class="tournament-match-head"><div><small>${m.roundLabel} · ${m.difficulty==='hard'?'СЛОЖНАЯ':'ЛЁГКАЯ'}</small><h2>${escapeHTML(m.homeName)} <i>VS</i> ${escapeHTML(m.awayName)}</h2></div><span>${phase}</span></div><div class="tournament-score"><b>${m.home}</b><span>${String(m.minute).padStart(2,'0')}'</span><b>${m.away}</b></div><div class="tournament-score-names"><span>${escapeHTML(m.homeName)}</span><span>${escapeHTML(m.awayName)}</span></div><div class="bar"><i style="width:${Math.min(100,m.minute/max*100)}%"></i></div><div class="tournament-live-log">${(m.log||[]).slice(-5).map(x=>`<div>${escapeHTML(x)}</div>`).join('')}</div><div class="mr-tournament-tactics"><label>СХЕМА<select id="mrTF">${['4-3-3','4-2-3-1','4-4-2','3-5-2'].map(x=>`<option ${state.formation===x?'selected':''}>${x}</option>`).join('')}</select></label><label>СТИЛЬ<select id="mrTS">${['Баланс','Атака','Оборона'].map(x=>`<option ${state.style===x?'selected':''}>${x}</option>`).join('')}</select></label><button class="outline" id="mrTApply">ПРИМЕНИТЬ ТАКТИКУ</button></div><div class="tournament-match-actions">${m.finished?'<button class="primary" id="tournamentContinue">ПРОДОЛЖИТЬ →</button>':m.ready?'<button class="primary" id="mrTKick">НАЧАТЬ МАТЧ</button>':m.halftime?'<button class="primary" id="mrTResume">НАЧАТЬ 2-Й ТАЙМ</button>':`<button class="outline" id="mrTPause">${m.paused?'ПРОДОЛЖИТЬ':'ПАУЗА'}</button><button class="outline" id="mrTSpeed">СКОРОСТЬ: ${v10MatchSpeed}X</button>`}</div>`;}
v10RenderMatch=mrTRender;
v10StartEntry=function(id,difficulty){let d=v10EnsureState(),e=d.entries[id],def=v10TournamentDefs().find(x=>x.id===id);if(!e||!def||e.cleared||(d.completed||0)>=2||((e.used||0)>=3&&!e.inProgress)){toast('Турнир недоступен');return;}if(v10TournamentMatch){toast('Сначала заверши текущий матч');return;}if(e.inProgress&&e.difficulty!==difficulty){toast('Продолжи попытку на прежней сложности');return;}if(e.difficulty!==difficulty){e.difficulty=difficulty;e.round=0;e.wins=0;e.inProgress=false;}if(e.round===0&&!e.inProgress)e.used++;e.inProgress=true;v10ActiveId=id;v10ActiveDifficulty=difficulty;save();v10RenderCards();v10RenderBracket();v10StartMatch();};
v10StartMatch=function(){v10StopTimer();let d=v10TournamentDefs().find(x=>x.id===v10ActiveId),e=v10GetEntry(v10ActiveId);if(!d||!e)return;let round=Math.min(2,e.round||0),names=['1/4 ФИНАЛА','ПОЛУФИНАЛ','ФИНАЛ'],opp=v10OpponentFor(d,round),hard=v10ActiveDifficulty==='hard',base=hard?(v10HolidayEra()?74:68):(v10HolidayEra()?58:53),rating=Math.max(42,Math.min(90,base+round*2+Math.floor(Math.random()*5)-2));v10TournamentMatch={minute:0,home:0,away:0,homeName:state.club?.name||'MR FOOTBALL 27',awayName:opp,round,roundLabel:names[round],difficulty:v10ActiveDifficulty,opponentRating:rating,finished:false,ready:true,paused:false,halftime:false,extraTime:false,log:['Команды готовы. Нажми «НАЧАТЬ МАТЧ».']};v10MatchSpeed=1;v10RenderMatch();save();};
function mrTStart(){let m=v10TournamentMatch;if(!m||m.finished)return;m.ready=false;m.paused=false;m.halftime=false;v10StopTimer();v10MatchTimer=setInterval(v10MatchTick,420/v10MatchSpeed);v10RenderMatch();save();}
v10MatchTick=function(){let m=v10TournamentMatch;if(!m||m.finished||m.ready||m.paused||m.halftime)return;let max=m.extraTime?120:90;m.minute=Math.min(max,m.minute+1);let diff=v10PlayerStrength()-m.opponentRating,h=Math.max(.004,Math.min(.04,.013+diff*.00055)),a=Math.max(.005,Math.min(.035,.014-diff*.00025)),r=Math.random();if(r<h){m.home++;m.log.push('ГОЛ! '+m.homeName);}else if(r<h+a){m.away++;m.log.push('Гол '+m.awayName);}else if(m.minute%12===0)m.log.push('Опасный момент у ворот.');if(m.minute===45&&!m.extraTime){m.halftime=true;v10StopTimer();m.log.push('Перерыв. Измени тактику или состав.');}else if(m.minute===90&&!m.extraTime&&m.home===m.away){m.extraTime=true;m.log.push('Ничья. Дополнительное время до 120-й минуты.');}else if(m.minute>=max){if(m.extraTime&&m.home===m.away){let x=3+Math.floor(Math.random()*3),y=3+Math.floor(Math.random()*3);m.penalties=[x,y];m.winner=x===y?(Math.random()<.5?'home':'away'):(x>y?'home':'away');m.log.push(`Пенальти: ${x} — ${y}.`);}else m.winner=m.home>m.away?'home':'away';m.finished=true;v10StopTimer();m.log.push('Финальный свисток!');}v10RenderMatch();if(m.finished)save();};
document.addEventListener('click',e=>{if(e.target.closest('#mrTKick')){e.preventDefault();e.stopImmediatePropagation();mrTStart();return;}if(e.target.closest('#mrTPause')){e.preventDefault();e.stopImmediatePropagation();let m=v10TournamentMatch;if(!m)return;m.paused=!m.paused;if(m.paused)v10StopTimer();else mrTStart();v10RenderMatch();return;}if(e.target.closest('#mrTResume')){e.preventDefault();e.stopImmediatePropagation();let m=v10TournamentMatch;if(!m)return;m.log.push('Начался второй тайм.');mrTStart();return;}if(e.target.closest('#mrTApply')){e.preventDefault();e.stopImmediatePropagation();state.formation=$('#mrTF')?.value||state.formation;state.style=$('#mrTS')?.value||state.style;if(v10TournamentMatch)v10TournamentMatch.log.push(`Тактика: ${state.formation}, ${state.style}.`);save();drawSquad();v10RenderMatch();toast('Тактика применена');return;}if(e.target.closest('#mrTSpeed')){e.preventDefault();e.stopImmediatePropagation();v10MatchSpeed=v10MatchSpeed===1?3:1;let m=v10TournamentMatch;if(m&&!m.ready&&!m.paused&&!m.halftime&&!m.finished){v10StopTimer();v10MatchTimer=setInterval(v10MatchTick,420/v10MatchSpeed);}v10RenderMatch();return;}},true);

/* Event cards are purchasable on the standard transfer market at a small premium. */
function mrInjectEventMarket(){if(!Array.isArray(state.market))state.market=[];for(let p of FCUC_EVENT_DB||[]){if(fcucOwned(p.name)||state.market.some(x=>fcucNameKey(x.name)===fcucNameKey(p.name)))continue;let base=Number(p.price)||fcucValue(Number(p.ovr)||60);state.market.push({...p,id:'evtmarket_'+p.id,type:'event-transfer',eventTransfer:true,price:Math.max(25000,Math.round(base*1.28/5000)*5000)});}}
mrInjectEventMarket();const mrRenderMarketOld=renderMarket;renderMarket=function(){mrInjectEventMarket();mrRenderMarketOld();};const mrSaveOld=save;save=function(){mrInjectEventMarket();mrSaveOld();};
document.title='MR FOOTBALL 27 · v1.2';let brand=$('.brand');if(brand){let b=brand.querySelector('b'),s=brand.querySelector('small');if(b)b.textContent='MR FOOTBALL 27';if(s)s.textContent='VERSION 1.2';}mrPauseButton();


/* ================= MR FOOTBALL 27 v1.2 ================= */
const MR_V12_SCHEMA=12;
const MR_V12_BACKUP_KEY=STORE_KEY+'_backup_before_v12';
const MR_V12_NEWYEAR_DB=[{"name":"Aleksey Batrakov","pos":"CAM","age":21,"nation":"Россия","club":"Galatasaray","value":0,"id":"ny_evt_batrakov_74","ovr":74,"price":0,"type":"event","event":"newyear","stats":{"PAC":75,"SHO":72,"PAS":79,"DRI":80,"DEF":57,"PHY":67},"league":"Другие лиги","realClub":"Галатасарай","basePlayerId":"db_0397"},{"name":"David de Gea","pos":"GK","age":36,"nation":"Испания","club":"Fiorentina","value":0,"id":"ny_evt_degea_76","ovr":76,"price":0,"type":"event","event":"newyear","stats":{"PAC":55,"SHO":45,"PAS":70,"DRI":68,"DEF":78,"PHY":73},"league":"Другие лиги","realClub":"Fiorentina"},{"name":"Hugo Ekitiké","pos":"ST","age":24,"nation":"Франция / Камерун","club":"Liverpool","value":0,"id":"ny_evt_ekitike_80","ovr":80,"price":0,"type":"event","event":"newyear","stats":{"PAC":84,"SHO":82,"PAS":74,"DRI":83,"DEF":39,"PHY":79},"league":"Английская Премьер-лига","realClub":"Ливерпуль","basePlayerId":"db_0041"},{"name":"Amadou Onana","pos":"CDM","age":25,"nation":"Бельгия / Сенегал","stats":{"PAC":74,"SHO":66,"PAS":78,"DRI":75,"DEF":87,"PHY":84},"club":"New Year 2026","value":40.0,"id":"ny27_001","ovr":78,"price":0,"type":"event","event":"newyear","league":"Английская Премьер-лига","basePlayerId":"db_0222","realClub":"Астон Вилла"},{"name":"Abde Ezzalzouli","pos":"LW","age":24,"nation":"Марокко / Испания","stats":{"PAC":84,"SHO":83,"PAS":79,"DRI":85,"DEF":59,"PHY":76},"club":"New Year 2026","value":40.0,"id":"ny27_002","ovr":78,"price":0,"type":"event","event":"newyear","league":"Испанская Ла Лига","basePlayerId":"db_0220","realClub":"Бетис"},{"name":"Christian Kofane","pos":"ST","age":20,"nation":"Камерун","stats":{"PAC":82,"SHO":86,"PAS":75,"DRI":81,"DEF":58,"PHY":82},"club":"New Year 2026","value":40.0,"id":"ny27_003","ovr":78,"price":0,"type":"event","event":"newyear","league":"Немецкая Бундеслига","basePlayerId":"db_0193","realClub":"Байер 04 Леверкузен"},{"name":"Scott McTominay","pos":"CM","age":29,"nation":"Шотландия / Англия","stats":{"PAC":77,"SHO":76,"PAS":82,"DRI":80,"DEF":74,"PHY":80},"club":"New Year 2026","value":40.0,"id":"ny27_004","ovr":78,"price":0,"type":"event","event":"newyear","league":"Итальянская Серия А","basePlayerId":"db_0245","realClub":"Наполи"},{"name":"Ilya Zabarnyi","pos":"CB","age":24,"nation":"Украина","stats":{"PAC":71,"SHO":58,"PAS":77,"DRI":68,"DEF":87,"PHY":85},"club":"New Year 2026","value":40.0,"id":"ny27_005","ovr":78,"price":0,"type":"event","event":"newyear","league":"Французская Лига 1","basePlayerId":"db_0214","realClub":"Пари Сен-Жермен"},{"name":"Andreas Schjelderup","pos":"LW","age":22,"nation":"Норвегия","stats":{"PAC":82,"SHO":81,"PAS":82,"DRI":83,"DEF":62,"PHY":74},"club":"New Year 2026","value":40.0,"id":"ny27_006","ovr":78,"price":0,"type":"event","event":"newyear","league":"Португальская Примейра","basePlayerId":"db_0205","realClub":"Бенфика"},{"name":"Vitor Roque","pos":"ST","age":21,"nation":"Бразилия","stats":{"PAC":79,"SHO":83,"PAS":77,"DRI":78,"DEF":60,"PHY":79},"club":"New Year 2026","value":38.0,"id":"ny27_007","ovr":77,"price":0,"type":"event","event":"newyear","league":"Бразильская Серия A","basePlayerId":"db_0247","realClub":"Палмейрас"},{"name":"Aleksandr Chernikov","pos":"CDM","age":26,"nation":"Россия","stats":{"PAC":75,"SHO":73,"PAS":81,"DRI":76,"DEF":86,"PHY":83},"club":"New Year 2026","value":34.0,"id":"ny27_008","ovr":77,"price":0,"type":"event","event":"newyear","league":"РПЛ","basePlayerId":"rpl_0910","realClub":"Краснодар"},{"name":"Francisco Trincão","pos":"RW","age":26,"nation":"Португалия","stats":{"PAC":82,"SHO":81,"PAS":81,"DRI":83,"DEF":62,"PHY":74},"club":"New Year 2026","value":40.0,"id":"ny27_009","ovr":78,"price":0,"type":"event","event":"newyear","league":"Саудовская Про-лига","basePlayerId":"db_0233","realClub":"Аль-Ахли"},{"name":"Max Dowman","pos":"RW","age":16,"nation":"Англия","stats":{"PAC":88,"SHO":82,"PAS":82,"DRI":84,"DEF":63,"PHY":80},"club":"New Year 2026","value":50.0,"id":"ny27_010","ovr":80,"price":0,"type":"event","event":"newyear","league":"Английская Премьер-лига","basePlayerId":"db_0113","realClub":"Арсенал"},{"name":"Rio Ngumoha","pos":"LW","age":18,"nation":"Англия / Нигерия","stats":{"PAC":87,"SHO":81,"PAS":82,"DRI":88,"DEF":62,"PHY":79},"club":"New Year 2026","value":50.0,"id":"ny27_011","ovr":80,"price":0,"type":"event","event":"newyear","league":"Английская Премьер-лига","basePlayerId":"db_0114","realClub":"Ливерпуль"},{"name":"Ibrahim Mbaye","pos":"RW","age":18,"nation":"Сенегал / Франция","stats":{"PAC":87,"SHO":81,"PAS":81,"DRI":88,"DEF":62,"PHY":79},"club":"New Year 2026","value":50.0,"id":"ny27_012","ovr":80,"price":0,"type":"event","event":"newyear","league":"Английская Премьер-лига","basePlayerId":"db_0115","realClub":"Астон Вилла"}];
const MR_V12_LEAGUE_MAP={"Ипсвич Таун":"Английская Премьер-лига","Тоттенхэм Хотспур":"Английская Премьер-лига","Ливерпуль":"Английская Премьер-лига","Лидс Юнайтед":"Английская Премьер-лига","Эвертон":"Английская Премьер-лига","Брайтон энд Хоув Альбион":"Английская Премьер-лига","Ньюкасл Юнайтед":"Английская Премьер-лига","Кристал Пэлас":"Английская Премьер-лига","Астон Вилла":"Английская Премьер-лига","Сандерленд":"Английская Премьер-лига","Арсенал":"Английская Премьер-лига","Борнмут":"Английская Премьер-лига","Вулверхэмптон Уондерерс":"Английская Премьер-лига","Вест Хэм Юнайтед":"Английская Премьер-лига","Челси":"Английская Премьер-лига","Манчестер Юнайтед":"Английская Премьер-лига","Манчестер Сити":"Английская Премьер-лига","Фулхэм":"Английская Премьер-лига","Брентфорд":"Английская Премьер-лига","Ноттингем Форест":"Английская Премьер-лига","Реал Сосьедад":"Испанская Ла Лига","Бетис":"Испанская Ла Лига","Вильярреал":"Испанская Ла Лига","Атлетик Бильбао":"Испанская Ла Лига","Валенсия":"Испанская Ла Лига","Депортиво Ла-Корунья":"Испанская Ла Лига","Реал Мадрид":"Испанская Ла Лига","Барселона":"Испанская Ла Лига","Атлетико Мадрид":"Испанская Ла Лига","Бавария Мюнхен":"Немецкая Бундеслига","Кёльн":"Немецкая Бундеслига","РБ Лейпциг":"Немецкая Бундеслига","Фрайбург":"Немецкая Бундеслига","Штутгарт":"Немецкая Бундеслига","Айнтрахт Франкфурт":"Немецкая Бундеслига","Майнц 05":"Немецкая Бундеслига","Байер 04 Леверкузен":"Немецкая Бундеслига","Аугсбург":"Немецкая Бундеслига","Боруссия Дортмунд":"Немецкая Бундеслига","Хоффенхайм":"Немецкая Бундеслига","Фиорентина":"Итальянская Серия А","Ювентус":"Итальянская Серия А","Лацио":"Итальянская Серия А","Аталанта":"Итальянская Серия А","Интернационале":"Итальянская Серия А","Милан":"Итальянская Серия А","Наполи":"Итальянская Серия А","Рома":"Итальянская Серия А","Комо 1907":"Итальянская Серия А","Ланс":"Французская Лига 1","Монако":"Французская Лига 1","Страсбур":"Французская Лига 1","Олимпик Лион":"Французская Лига 1","Лилль":"Французская Лига 1","Стад Ренн":"Французская Лига 1","Пари Сен-Жермен":"Французская Лига 1","Олимпик Марсель":"Французская Лига 1","АЗ Алкмар":"Нидерландская Эредивизи","ПСВ Эйндховен":"Нидерландская Эредивизи","Аякс":"Нидерландская Эредивизи","Фейеноорд Роттердам":"Нидерландская Эредивизи","Бенфика":"Португальская Примейра","Спортинг Лиссабон":"Португальская Примейра","Брага":"Португальская Примейра","Порту":"Португальская Примейра","Палмейрас":"Бразильская Серия A","Ботафого":"Бразильская Серия A","Фламенго":"Бразильская Серия A","Сантос":"Бразильская Серия A","Крузейро":"Бразильская Серия A","Спартак Москва":"РПЛ","Динамо Москва":"РПЛ","Ростов":"РПЛ","Рубин Казань":"РПЛ","Зенит":"РПЛ","ЦСКА Москва":"РПЛ","Краснодар":"РПЛ","Локомотив Москва":"РПЛ","Аль-Diriyah FC":"Саудовская Про-лига","Al-Nassr":"Саудовская Про-лига","Иттихад":"Саудовская Про-лига","Аль-Кадсия Эль-Хубар":"Саудовская Про-лига","Аль-Ахли":"Саудовская Про-лига","Аль-Хилаль Эр-Рияд":"Саудовская Про-лига"};
const MR_V12_TODAY=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};
const MR_V12_EVENT_START='2026-12-10';
const MR_V12_EVENT_END='2027-01-05';
const MR_V12_IS_NEWYEAR=()=>MR_V12_TODAY()>=MR_V12_EVENT_START&&MR_V12_TODAY()<=MR_V12_EVENT_END;
const MR_V12_SAFE_NUM=(v,d=0)=>Number.isFinite(Number(v))?Number(v):d;

/* Save migration: keep the original storage key and back up the pre-v1.2 bytes once. */
try{
 const raw=localStorage.getItem(STORE_KEY)||localStorage.getItem('fcuc_winter_save_v5');
 if(raw&&!localStorage.getItem(MR_V12_BACKUP_KEY))localStorage.setItem(MR_V12_BACKUP_KEY,raw);
}catch(e){console.warn('v1.2 backup skipped',e);}
state=state||freshState();
state.players=Array.isArray(state.players)?state.players:[];
state.market=Array.isArray(state.market)?state.market:[];
state.startingXI=Array.isArray(state.startingXI)?state.startingXI:[];
state.bench=Array.isArray(state.bench)?state.bench:[];
state.reserve=Array.isArray(state.reserve)?state.reserve:[];
state.tactics={mentality:state.style||'Баланс',width:'Стандартная',depth:'Средняя',press:'Средний',tempo:'Стандартный',pass:'Смешанный',instruction:'Сбалансированно',instructions:[],...(state.tactics||{})};
state.tactics.instructions=Array.isArray(state.tactics.instructions)?state.tactics.instructions:[];
state.fitness=state.fitness&&typeof state.fitness==='object'?state.fitness:{};
state.form=state.form&&typeof state.form==='object'?state.form:{};
state.stadiumLevel=Math.max(1,Math.min(5,MR_V12_SAFE_NUM(state.stadiumLevel,1)));
state.trainingTokens=MR_V12_SAFE_NUM(state.trainingTokens,0);state.matchDifficulty=state.matchDifficulty||'Профессиональная';
state.dailyRewardsClaimed=Array.isArray(state.dailyRewardsClaimed)?state.dailyRewardsClaimed:[];state.dailyRewardsStartDate=state.dailyRewardsStartDate||MR_V12_TODAY();
state.newYearTokens=MR_V12_SAFE_NUM(state.newYearTokens,0);state.newYearGiftClaims=Array.isArray(state.newYearGiftClaims)?state.newYearGiftClaims:[];
state.exchangeOffers=state.exchangeOffers&&typeof state.exchangeOffers==='object'?state.exchangeOffers:{};
state.schemaVersion=MR_V12_SCHEMA;
state.players.forEach(p=>{
 if(!p.baseOvr)p.baseOvr=MR_V12_SAFE_NUM(p.ovr,50);
 p.rankLevel=Math.max(0,Math.min(5,MR_V12_SAFE_NUM(p.rankLevel,MR_V12_SAFE_NUM(p.ovr,50)-MR_V12_SAFE_NUM(p.baseOvr,MR_V12_SAFE_NUM(p.ovr,50)))));
 if(!p.league)p.league=MR_V12_LEAGUE_MAP[p.club]||'Другие лиги';
 if(state.fitness[p.id]===undefined)state.fitness[p.id]=100;
 if(state.form[p.id]===undefined)state.form[p.id]=0;
});
const mrV12SaveBase=save;
save=function(){
 state.schemaVersion=MR_V12_SCHEMA;
 state.lastSavedAt=new Date().toISOString();
 try{mrV12SaveBase();}catch(e){console.error('v1.2 save failed',e);}
};

/* New Year event pool: additional real-player event versions, all capped at 80 OVR. */
for(const p of MR_V12_NEWYEAR_DB){
 if(!v09CardDefs.some(x=>x.id===p.id))v09CardDefs.push({...p});
}
for(let i=FCUC_EVENT_DB.length-1;i>=0;i--){
 if(FCUC_EVENT_DB[i].event==='newyear')FCUC_EVENT_DB.splice(i,1);
}

/* Weekly rotating login rewards: every 7 days the reward set changes. Missed days do not reset anything. */
const MR_V12_REWARD_SETS=[
 [
  {type:'coins',amount:15000,label:'15 000 монет'},{type:'gems',amount:10,label:'10 самоцветов'},
  {type:'coins',amount:25000,label:'25 000 монет'},{type:'training',amount:1,label:'1 жетон тренировки'},
  {type:'eventTokens',amount:25,label:'25 зимних жетонов'},{type:'coins',amount:40000,label:'40 000 монет'},
  {type:'bundle',coins:75000,gems:50,label:'75 000 монет + 50 самоцветов'}
 ],
 [
  {type:'coins',amount:20000,label:'20 000 монет'},{type:'gems',amount:15,label:'15 самоцветов'},
  {type:'eventTokens',amount:35,label:'35 зимних жетонов'},{type:'coins',amount:30000,label:'30 000 монет'},
  {type:'training',amount:2,label:'2 жетона тренировки'},{type:'gems',amount:30,label:'30 самоцветов'},
  {type:'bundle',coins:90000,gems:60,label:'90 000 монет + 60 самоцветов'}
 ],
 [
  {type:'gems',amount:20,label:'20 самоцветов'},{type:'coins',amount:25000,label:'25 000 монет'},
  {type:'training',amount:1,label:'1 жетон тренировки'},{type:'eventTokens',amount:45,label:'45 зимних жетонов'},
  {type:'coins',amount:45000,label:'45 000 монет'},{type:'gems',amount:35,label:'35 самоцветов'},
  {type:'bundle',coins:100000,gems:75,label:'100 000 монет + 75 самоцветов'}
 ],
 [
  {type:'coins',amount:25000,label:'25 000 монет'},{type:'eventTokens',amount:40,label:'40 зимних жетонов'},
  {type:'gems',amount:25,label:'25 самоцветов'},{type:'training',amount:2,label:'2 жетона тренировки'},
  {type:'coins',amount:50000,label:'50 000 монет'},{type:'winterGems',amount:20,label:'20 зимних самоцветов'},
  {type:'bundle',coins:125000,gems:100,label:'125 000 монет + 100 самоцветов'}
 ]
];
function mrV12DailyInfo(){
 const today=MR_V12_TODAY(),start=state.dailyRewardsStartDate||today,base=new Date(...start.split('-').map((x,i)=>i===1?Number(x)-1:Number(x))),now=new Date(...today.split('-').map((x,i)=>i===1?Number(x)-1:Number(x)));
 now.setHours(0,0,0,0);base.setHours(0,0,0,0);
 const days=Math.max(0,Math.floor((now-base)/86400000)),week=Math.floor(days/7),day=days%7+1,cycle=week%MR_V12_REWARD_SETS.length;
 return {today,start,weekIndex:week,week:week+1,day,cycle,rewards:MR_V12_REWARD_SETS[cycle]};
}
function mrV12RenderDaily(){
 const grid=$('#mrDailyGrid');if(!grid)return;
 const info=mrV12DailyInfo(),claimed=state.dailyRewardsClaimed.includes(info.today),r=info.rewards[info.day-1];
 const title=$('#mrDailyCycle');if(title)title.textContent=`НЕДЕЛЯ ${info.week} · НАБОР ${info.cycle+1}/4`;
 const head=$('#mrDailyHeadline');if(head)head.textContent=`ДЕНЬ ${info.day} ИЗ 7`;
 const hint=$('#mrDailyHint');if(hint)hint.textContent=claimed?'Сегодняшняя награда уже получена. Завтра откроется следующий день.':'Пропуск дня не сбрасывает прогресс. Доступна награда текущего календарного дня.';
 const weekStart=new Date(info.start+'T00:00:00');
 grid.innerHTML=info.rewards.map((x,i)=>{const dayDate=new Date(weekStart);dayDate.setDate(dayDate.getDate()+info.weekIndex*7+i);const key=`${dayDate.getFullYear()}-${String(dayDate.getMonth()+1).padStart(2,'0')}-${String(dayDate.getDate()).padStart(2,'0')}`,done=state.dailyRewardsClaimed.includes(key);return `<article class="mr-v12-day ${i===6?'special ':''}${i+1===info.day?'current ':''}${done?'claimed':''}"><small>ДЕНЬ ${i+1}</small><b>${i===6?'★ ОСОБАЯ НАГРАДА':'НАГРАДА'}</b><span>${x.label}</span>${done?'<small>ПОЛУЧЕНО</small>':i+1===info.day?'<small>ДОСТУПНО СЕГОДНЯ</small>':''}</article>`;}).join('');
 const b=$('#mrDailyClaim');if(b){b.disabled=claimed;b.textContent=claimed?'ПОЛУЧЕНО СЕГОДНЯ':'ЗАБРАТЬ · '+r.label;}
}
function mrV12ClaimDaily(){
 const info=mrV12DailyInfo();if(state.dailyRewardsClaimed.includes(info.today)){toast('Сегодняшняя награда уже получена');return;}
 const r=info.rewards[info.day-1];
 if(r.type==='coins')state.coins+=r.amount;
 else if(r.type==='gems')state.gems+=r.amount;
 else if(r.type==='eventTokens')state.eventTokens=(Number(state.eventTokens)||0)+r.amount;
 else if(r.type==='winterGems'){state.winterGems=(Number(state.winterGems)||0)+r.amount;state.eventCoins=state.winterGems;}
 else if(r.type==='training')state.trainingTokens+=r.amount;
 else if(r.type==='bundle'){state.coins+=r.coins;state.gems+=r.gems;}
 state.dailyRewardsClaimed.push(info.today);
 save();updateWallet();mrV12RenderDaily();mrV12RenderDevelopment();
 modal('ЕЖЕДНЕВНАЯ НАГРАДА',`Получено: ${r.label}. Прогресс не сбрасывается, если пропустить следующий день.`);
}

/* Stadium upgrades: small, controlled home-match reward bonus. */
const MR_V12_STADIUM_COST=[0,50000,125000,250000,500000];
const MR_V12_STADIUM_NAMES=['Базовая арена','Новые трибуны','Современное освещение','Расширенная вместимость','Элитный стадион'];
function mrV12RenderStadium(){
 const lv=state.stadiumLevel||1,bonus=(lv-1)*2;
 const set=(id,v)=>{const e=$('#'+id);if(e)e.textContent=v;};
 set('mrStadiumLevel',`${lv} / 5`);set('mrStadiumDescription',MR_V12_STADIUM_NAMES[lv-1]+'.');
 set('mrStadiumBonus',`Бонус к наградам за матч: +${bonus}%`);
 const bar=$('#mrStadiumBar');if(bar)bar.style.width=(lv*20)+'%';
 const next=lv<5?MR_V12_STADIUM_NAMES[lv]: 'Максимальный уровень достигнут';
 set('mrStadiumNext',next);
 set('mrStadiumCost',lv<5?`Стоимость: ${fmt(MR_V12_STADIUM_COST[lv])} монет`:'У стадиона максимальный уровень.');
 const b=$('#mrStadiumUpgrade');if(b){b.disabled=lv>=5||state.coins<MR_V12_STADIUM_COST[lv];b.textContent=lv>=5?'МАКСИМАЛЬНЫЙ УРОВЕНЬ':`УЛУЧШИТЬ · ${fmt(MR_V12_STADIUM_COST[lv])} ●`;}
}
function mrV12UpgradeStadium(){
 const lv=state.stadiumLevel||1;if(lv>=5)return;
 const cost=MR_V12_STADIUM_COST[lv];if(state.coins<cost){toast('Недостаточно монет');return;}
 state.coins-=cost;state.stadiumLevel=lv+1;save();updateWallet();mrV12RenderStadium();
 modal('СТАДИОН УЛУЧШЕН',`${MR_V12_STADIUM_NAMES[lv]} открыт. Бонус к наградам за матчи теперь +${lv*2}%.`);
}

/* Player evolution: every owned card can be raised by up to +5 OVR. */
function mrV12RenderDevelopment(){
 const sel=$('#mrUpgradePlayer');if(!sel)return;
 const previous=sel.value;
 sel.innerHTML=state.players.map(p=>`<option value="${escapeHTML(p.id)}">${escapeHTML(p.name)} · ${p.pos} · ${p.ovr} OVR</option>`).join('');
 if(state.players.some(p=>p.id===previous))sel.value=previous;
 const tokens=$('#mrTrainingTokens');if(tokens)tokens.textContent=fmt(state.trainingTokens||0);
 mrV12RenderUpgradePreview();
}
function mrV12RenderUpgradePreview(){
 const box=$('#mrUpgradePreview'),sel=$('#mrUpgradePlayer');if(!box||!sel)return;
 const p=state.players.find(x=>x.id===sel.value)||state.players[0];if(!p){box.textContent='В клубе пока нет игроков.';return;}
 const base=MR_V12_SAFE_NUM(p.baseOvr,p.ovr),rank=MR_V12_SAFE_NUM(p.rankLevel,Math.max(0,p.ovr-base)),max=base+5,cost=10000+rank*5000;
 box.innerHTML=`<b>${escapeHTML(p.name)}</b> · ${p.pos}<div class="mr-v12-stat-grid"><div class="mr-v12-stat"><small>ТЕКУЩИЙ OVR</small><b>${p.ovr}</b></div><div class="mr-v12-stat"><small>ПОСЛЕ УЛУЧШЕНИЯ</small><b>${Math.min(max,p.ovr+1)}</b></div><div class="mr-v12-stat"><small>ПРОГРЕСС</small><b>+${rank}/5</b></div><div class="mr-v12-stat"><small>СТОИМОСТЬ</small><b>${fmt(cost)} ●</b></div><div class="mr-v12-stat"><small>ФИЗИЧЕСКАЯ ГОТОВНОСТЬ</small><b>${Math.round(MR_V12_SAFE_NUM(state.fitness[p.id],100))}%</b></div><div class="mr-v12-stat"><small>ФОРМА</small><b>${MR_V12_SAFE_NUM(state.form[p.id],0)>0?'+':''}${MR_V12_SAFE_NUM(state.form[p.id],0)}</b></div></div>`;
 const b=$('#mrUpgradeButton');if(b){b.disabled=rank>=5||state.trainingTokens<1||state.coins<cost;b.textContent=rank>=5?'МАКСИМАЛЬНЫЙ РЕЙТИНГ':`УЛУЧШИТЬ · +1 OVR`;}
}
function mrV12RankUp(){
 const p=state.players.find(x=>x.id===$('#mrUpgradePlayer')?.value);if(!p)return;
 const base=MR_V12_SAFE_NUM(p.baseOvr,p.ovr),rank=MR_V12_SAFE_NUM(p.rankLevel,Math.max(0,p.ovr-base)),cost=10000+rank*5000;
 if(rank>=5||p.ovr>=base+5){toast('Эта карточка уже достигла максимума +5');return;}
 if(state.trainingTokens<1){toast('Нужен жетон тренировки');return;}
 if(state.coins<cost){toast('Недостаточно монет');return;}
 state.trainingTokens--;state.coins-=cost;p.baseOvr=base;p.rankLevel=rank+1;p.ovr=Math.min(base+5,MR_V12_SAFE_NUM(p.ovr,base)+1);
 p.price=Math.max(MR_V12_SAFE_NUM(p.price,0),fcucValue(p.ovr));
 save();updateWallet();drawSquad();updateOverall();mrV12RenderDevelopment();renderMarket();
 modal('УЛУЧШЕНИЕ УСПЕШНО',`${p.name}: теперь ${p.ovr} OVR. Прогресс карточки +${p.rankLevel}/5.`);
}
function mrV12BuyTrainingToken(){
 if(state.coins<20000){toast('Нужно 20 000 монет');return;}
 state.coins-=20000;state.trainingTokens++;save();updateWallet();mrV12RenderDevelopment();toast('Получен 1 жетон тренировки');
}

/* Chemistry is a small squad bonus, not a direct card OVR increase. */
function mrV12Chemistry(){
 const players=(state.startingXI||[]).map(id=>state.players.find(p=>p.id===id)).filter(Boolean);
 if(players.length<2)return 50;
 let synergy=0;
 for(let i=0;i<players.length;i++)for(let j=i+1;j<players.length;j++){
  const a=players[i],b=players[j];
  const ca=a.realClub||a.club,cb=b.realClub||b.club;if(ca&&cb&&ca===cb&&ca!=='Winter Wunderkind'&&ca!=='New Year 2026')synergy+=1.2;
  if(a.league&&b.league&&a.league===b.league)synergy+=.55;
  if(a.nation&&b.nation&&a.nation===b.nation)synergy+=.35;
 }
 return Math.max(40,Math.min(100,Math.round(45+synergy)));
}
const mrV12UpdateOverallBase=updateOverall;
updateOverall=function(){mrV12UpdateOverallBase();const c=mrV12Chemistry();const b=document.querySelector('.chem b');if(b)b.textContent=c;const bar=document.querySelector('.chem .bar i');if(bar)bar.style.width=c+'%';state.chemistry=c;};

/* Market filters: ordinary / winter / New Year, plus sorting. */
const mrV12MarketRenderBase=mrRenderMarketOld;
const mrV12InjectMarketBase=mrInjectEventMarket;
mrInjectEventMarket=function(){
 mrV12InjectMarketBase();
 if(!Array.isArray(state.market))state.market=[];
 if(state.marketDatabaseVersion!==MR_V12_SCHEMA){
  const ids=new Set(state.market.map(x=>x.id)),names=new Set(state.market.map(x=>fcucNameKey(x.name)));
  for(const p of FCUC_PLAYER_DB){const key=fcucNameKey(p.name);if(fcucOwned(p.name)||ids.has(p.id)||names.has(key))continue;state.market.push({...p,price:p.price||fcucValue(p.ovr),eventGroup:'base'});ids.add(p.id);names.add(key);}
  state.marketDatabaseVersion=MR_V12_SCHEMA;
 }
 for(const p of state.market){if(p.event==='newyear'||String(p.id||'').includes('ny_evt_')||String(p.id||'').includes('ny27_'))p.eventGroup='newyear';else if(p.event==='winter'||p.club==='Winter Wunderkind'||p.type==='event-transfer')p.eventGroup='winter';else if(!p.eventGroup)p.eventGroup='base';}
 const nyOpen=MR_V12_TODAY()>=MR_V12_EVENT_START;
 if(!nyOpen)state.market=state.market.filter(p=>p.eventGroup!=='newyear');
 if(nyOpen){
  for(const p of MR_V12_NEWYEAR_DB){
   if(fcucOwned(p.name)||state.market.some(x=>x.id==='evtmarket_'+p.id))continue;
   const base=Number(p.price)||fcucValue(Number(p.ovr)||75);
   state.market.push({...p,id:'evtmarket_'+p.id,eventGroup:'newyear',eventTransfer:true,price:Math.max(25000,Math.round(base*1.28/5000)*5000)});
  }
 }
 for(const p of state.market){
  if(p.eventGroup)continue;
  if(p.event==='newyear'||String(p.id||'').includes('ny27_'))p.eventGroup='newyear';
  else if(p.event==='winter'||p.club==='Winter Wunderkind'||p.type==='event-transfer')p.eventGroup='winter';
  else p.eventGroup='base';
 }
};
renderMarket=function(){
 mrInjectEventMarket();
 const all=state.market,ev=$('#marketEventFilter')?.value||'all',sort=$('#marketSort')?.value||'rating-desc';
 let data=all.filter(p=>ev==='all'||(ev==='base'?(p.eventGroup==='base'||!p.eventGroup):p.eventGroup===ev));
 data=data.slice().sort((a,b)=>{
  if(sort==='rating-asc')return (+a.ovr||0)-(+b.ovr||0);
  if(sort==='price-asc')return (+a.price||0)-(+b.price||0);
  if(sort==='price-desc')return (+b.price||0)-(+a.price||0);
  return (+b.ovr||0)-(+a.ovr||0);
 });
 state.market=data;
 mrV12MarketRenderBase();
 state.market=all;
};
$('#marketEventFilter')?.addEventListener('change',renderMarket);
$('#marketSort')?.addEventListener('change',renderMarket);

/* Exchanges: tiered OVR ranges, with strict winter-event requirements. */
const MR_V12_EXCHANGE_RULES={
 normal:{min:75,max:82,fodder:60,count:3,coins:10000,label:'ОБЫЧНЫЙ ОБМЕН'},
 advanced:{min:83,max:87,fodder:70,count:3,coins:30000,label:'ПРОДВИНУТЫЙ ОБМЕН'},
 elite:{min:88,max:91,fodder:80,count:3,coins:70000,label:'ЭЛИТНЫЙ ОБМЕН'}
};
function mrV12AvailableFodder(min=0){
 return state.players.filter(p=>!(state.startingXI||[]).includes(p.id)&&Number(p.ovr)>=min);
}
function mrV12Options(min,placeholder,selected){
 const rows=mrV12AvailableFodder(min);
 return `<option value="">${placeholder}</option>`+rows.map(p=>`<option value="${escapeHTML(p.id)}" ${p.id===selected?'selected':''}>${escapeHTML(p.name)} · ${p.ovr} OVR</option>`).join('');
}
function mrV12EnsureOffers(){
 const key=mrV12DailyInfo().week;
 if(state.exchangeOffers.week!==key){state.exchangeOffers={week:key};}
 for(const tier of Object.keys(MR_V12_EXCHANGE_RULES)){
  const rule=MR_V12_EXCHANGE_RULES[tier],pool=FCUC_PLAYER_DB.filter(p=>p.league&&p.league!=='Другие лиги'&&p.ovr>=rule.min&&p.ovr<=rule.max&&!fcucOwned(p.name));
  if(!Array.isArray(state.exchangeOffers[tier])||state.exchangeOffers[tier].some(id=>!pool.some(p=>p.id===id))){
   const copy=pool.slice(),ids=[];while(copy.length&&ids.length<3){const i=Math.floor(Math.random()*copy.length);ids.push(copy.splice(i,1)[0].id);}
   state.exchangeOffers[tier]=ids;
  }
 }
}
function mrV12ExchangeCard(tier,id,index){
 const p=FCUC_PLAYER_DB.find(x=>x.id===id);if(!p)return '';
 const r=MR_V12_EXCHANGE_RULES[tier];
 return `<article class="mr-v12-exchange-card"><div class="ovr">${p.ovr} OVR</div><h3>${escapeHTML(p.name)}</h3><p>${escapeHTML(p.club)} · ${escapeHTML(p.league||'')}</p><small>Требуется: ${r.count} игрока ${r.fodder}+ и ${fmt(r.coins)} монет</small><button class="primary full" data-mr-exchange="${tier}" data-offer="${index}">ОБМЕНЯТЬ</button></article>`;
}
function mrV12RenderExchanges(){
 mrV12EnsureOffers();const wb=$('#mrExchangeWinterTokens'),nb=$('#mrExchangeNewYearTokens');if(wb)wb.textContent=fmt(state.eventTokens||0);if(nb)nb.textContent=fmt(state.newYearTokens||0);
 const selectors=[
  ['mrFodder1',60,'Игрок для обмена 1'],['mrFodder2',60,'Игрок для обмена 2'],['mrFodder3',60,'Игрок для обмена 3'],
  ['mrWinterFodder1',74,'Выбери игрока 74+'],['mrWinterFodder2',70,'Выбери игрока 70+'],
  ['mrNewYearFodder1',75,'Выбери игрока 75+'],['mrNewYearFodder2',70,'Выбери игрока 70+']
 ];
 for(const [id,min,label] of selectors){const e=$('#'+id);if(e){const old=e.value;e.innerHTML=mrV12Options(min,label,old);}}
 for(const tier of Object.keys(MR_V12_EXCHANGE_RULES)){
  const box=$('#mrExchange'+tier[0].toUpperCase()+tier.slice(1));
  if(box)box.innerHTML=(state.exchangeOffers[tier]||[]).map((id,i)=>mrV12ExchangeCard(tier,id,i)).join('')||'<p class="muted">Нет доступных карточек этого рейтинга.</p>';
 }
 const winter=$('#mrExchangeWinter');
 if(winter){const pool=FCUC_EVENT_DB.filter(p=>p.ovr>=70&&p.ovr<=75&&!fcucOwned(p.name));winter.innerHTML=pool.length?`<button class="primary" data-mr-exchange="winter">ПОЛУЧИТЬ СЛУЧАЙНУЮ КАРТОЧКУ 70–75 · 120 ЗИМНИХ ЖЕТОНОВ</button><small class="muted">Доступно карточек: ${pool.length}</small>`:'<p class="muted">Доступные зимние карточки закончились.</p>';}
 const ny=$('#mrExchangeNewYear');
 if(ny){const pool=MR_V12_NEWYEAR_DB.filter(p=>p.ovr>=75&&p.ovr<=80&&!fcucOwned(p.name));ny.innerHTML=MR_V12_IS_NEWYEAR()?(pool.length?`<button class="primary" data-mr-exchange="newyear">ПОЛУЧИТЬ КАРТОЧКУ 75–80 · 150 ЖЕТОНОВ NEW YEAR</button>`:'<p class="muted">Доступные новогодние карточки закончились.</p>'):MR_V12_TODAY()<MR_V12_EVENT_START?'<p class="muted">Обмен откроется 10 декабря 2026 года.</p>':'<p class="muted">Новогоднее событие завершено. Карточки остаются на трансферном рынке.</p>';}
}
function mrV12ConsumeFodder(ids){
 for(const id of ids){state.players=state.players.filter(p=>p.id!==id);state.bench=(state.bench||[]).filter(x=>x!==id);state.reserve=(state.reserve||[]).filter(x=>x!==id);}
}
function mrV12AddRewardCard(card,origin){
 if(!card||fcucOwned(card.name))return false;
 const owned={...card,id:`mr12_${origin}_${card.id}_${Date.now()}`,baseOvr:Number(card.ovr)||50,rankLevel:0,price:0,acquiredFrom:origin};
 state.players.push(owned);
 if(state.bench.length<7)state.bench.push(owned.id);else{state.reserve=state.reserve||[];state.reserve.push(owned.id);}
 return owned;
}
function mrV12DoExchange(tier,index=0){
 let target=null,chosen=[],costCoins=0,costTokens=0;
 if(MR_V12_EXCHANGE_RULES[tier]){
  const r=MR_V12_EXCHANGE_RULES[tier],ids=['mrFodder1','mrFodder2','mrFodder3'].map(id=>$('#'+id)?.value||'');
  if(ids.some(x=>!x)||new Set(ids).size!==3){toast('Выбери трёх разных игроков');return;}
  const fodder=ids.map(id=>state.players.find(p=>p.id===id));
  if(fodder.some(p=>!p||Number(p.ovr)<r.fodder||(state.startingXI||[]).includes(p.id))){toast(`Для этого обмена нужны три игрока ${r.fodder}+ из запаса или резерва`);return;}
  const id=state.exchangeOffers[tier]?.[index],pool=FCUC_PLAYER_DB.filter(p=>p.ovr>=r.min&&p.ovr<=r.max&&!fcucOwned(p.name));
  target=pool.find(p=>p.id===id)||pool[Math.floor(Math.random()*pool.length)];chosen=ids;costCoins=r.coins;
 }else if(tier==='winter'){
  chosen=['mrWinterFodder1','mrWinterFodder2'].map(id=>$('#'+id)?.value||'');
  if(chosen.some(x=>!x)||chosen[0]===chosen[1]){toast('Выбери двух разных игроков');return;}
  const a=state.players.find(p=>p.id===chosen[0]),b=state.players.find(p=>p.id===chosen[1]);
  if(!a||!b||a.ovr<74||b.ovr<70||state.startingXI.includes(a.id)||state.startingXI.includes(b.id)){toast('Условия: один игрок 74+ и один игрок 70+ из запаса или резерва');return;}
  if((state.eventTokens||0)<120){toast('Нужно 120 зимних жетонов');return;}
  const pool=FCUC_EVENT_DB.filter(p=>p.ovr>=70&&p.ovr<=75&&!fcucOwned(p.name));target=pool[Math.floor(Math.random()*pool.length)];costTokens=120;
 }else if(tier==='newyear'){
  if(!MR_V12_IS_NEWYEAR()){toast('Новогоднее событие ещё не началось');return;}
  chosen=['mrNewYearFodder1','mrNewYearFodder2'].map(id=>$('#'+id)?.value||'');
  if(chosen.some(x=>!x)||chosen[0]===chosen[1]){toast('Выбери двух разных игроков');return;}
  const a=state.players.find(p=>p.id===chosen[0]),b=state.players.find(p=>p.id===chosen[1]);
  if(!a||!b||a.ovr<75||b.ovr<70||state.startingXI.includes(a.id)||state.startingXI.includes(b.id)){toast('Условия: один игрок 75+ и один игрок 70+');return;}
  if((state.newYearTokens||0)<150){toast('Нужно 150 жетонов New Year');return;}
  const pool=MR_V12_NEWYEAR_DB.filter(p=>p.ovr>=75&&p.ovr<=80&&!fcucOwned(p.name));target=pool[Math.floor(Math.random()*pool.length)];costTokens=150;
 }
 if(!target){toast('Нет доступных карточек для обмена');return;}
 if(costCoins&&state.coins<costCoins){toast('Недостаточно монет');return;}
 if(costTokens&&tier==='winter'&&(state.eventTokens||0)<costTokens)return;
 if(costTokens&&tier==='newyear'&&(state.newYearTokens||0)<costTokens)return;
 if(costCoins)state.coins-=costCoins;
 if(tier==='winter')state.eventTokens-=costTokens;
 if(tier==='newyear')state.newYearTokens-=costTokens;
 mrV12ConsumeFodder(chosen);
 const added=mrV12AddRewardCard(target,tier);
 if(!added){toast('Карточка уже есть в клубе. Попробуй обновить обмен.');return;}
 state.exchangeOffers[tier]=null;
 save();updateWallet();drawSquad();if(typeof renderReserve==='function')renderReserve();mrV12RenderExchanges();updateOverall();
 modal('ОБМЕН УСПЕШЕН',`Получен ${target.name} · ${target.ovr} OVR. Карточка добавлена в клуб.`);
}

/* Match settings, live stats, fatigue and form. */
function mrV12NewStats(){
 return {possessionHome:0,possessionAway:0,shotsHome:0,shotsAway:0,onTargetHome:0,onTargetAway:0,cornersHome:0,cornersAway:0,foulsHome:0,foulsAway:0,offsidesHome:0,offsidesAway:0,passesHome:0,accurateHome:0,passesAway:0,accurateAway:0};
}
function mrV12StatsHTML(s){
 if(!s)return '<p class="muted">Статистика появится после начала матча.</p>';
 const pc=(a,b)=>Math.round(100*a/Math.max(1,a+b));
 const rows=[
  ['ВЛАДЕНИЕ',`${pc(s.possessionHome,s.possessionAway)}% — ${pc(s.possessionAway,s.possessionHome)}%`],
  ['УДАРЫ',`${s.shotsHome} — ${s.shotsAway}`],['В СТВОР',`${s.onTargetHome} — ${s.onTargetAway}`],
  ['УГЛОВЫЕ',`${s.cornersHome} — ${s.cornersAway}`],['ФОЛЫ',`${s.foulsHome} — ${s.foulsAway}`],
  ['ОФСАЙДЫ',`${s.offsidesHome} — ${s.offsidesAway}`],
  ['ТОЧНОСТЬ ПЕРЕДАЧ',`${pc(s.accurateHome,s.passesHome-s.accurateHome)}% — ${pc(s.accurateAway,s.passesAway-s.accurateAway)}%`]
 ];
 return '<div class="mr-v12-stat-grid">'+rows.map(([a,b])=>`<div class="mr-v12-stat"><small>${a}</small><b>${b}</b></div>`).join('')+'</div>';
}
function mrV12RenderMatchStats(){
 const box=$('#mrMatchStats');if(!box)return;
 box.innerHTML='<strong>СТАТИСТИКА МАТЧА</strong>'+mrV12StatsHTML(match?.finalStats||match?.stats||state.lastMatchStats);
}
function mrV12Tactics(){
 const t=state.tactics||{};
 return {
  mentality:t.mentality||state.style||'Баланс',width:t.width||'Стандартная',depth:t.depth||'Средняя',
  press:t.press||'Средний',tempo:t.tempo||'Стандартный',pass:t.pass||'Смешанный',instruction:t.instruction||'Сбалансированно',instructions:Array.isArray(t.instructions)?t.instructions:[],difficulty:state.matchDifficulty||'Профессиональная'
 };
}
function mrV12ApplyTacticControls(){
 const t=mrV12Tactics(),set=(id,value)=>{const e=$('#'+id);if(e&&[...e.options].some(o=>o.value===value||o.textContent===value))e.value=value;};
 document.querySelectorAll('[data-mr-tactic]').forEach(e=>{const k=e.dataset.mrTactic;if(t[k]&&e.options&&[...e.options].some(o=>o.value===t[k]||o.textContent===t[k]))e.value=t[k];});
 document.querySelectorAll('[data-mr-instruction]').forEach(e=>{e.checked=t.instructions.includes(e.dataset.mrInstruction);});
 document.querySelectorAll('[data-mr-match-setting]').forEach(e=>{if(e.dataset.mrMatchSetting==='difficulty')e.value=state.matchDifficulty||'Профессиональная';});
 set('tacticWidth',t.width);set('tacticLine',t.depth);set('tacticPress',t.press);set('tacticBuild',t.pass);set('tacticMentality',t.mentality);set('matchFormation',state.formation||'4-3-3');set('matchStyle',state.style||'Баланс');set('formation',state.formation||'4-3-3');
}
document.addEventListener('change',e=>{
 const setting=e.target.closest('[data-mr-match-setting]');
 if(setting){if(setting.dataset.mrMatchSetting==='difficulty')state.matchDifficulty=setting.value;save();return;}
 const inst=e.target.closest('[data-mr-instruction]');
 if(inst){state.tactics=state.tactics||{};state.tactics.instructions=Array.isArray(state.tactics.instructions)?state.tactics.instructions:[];const key=inst.dataset.mrInstruction;if(inst.checked&&!state.tactics.instructions.includes(key))state.tactics.instructions.push(key);if(!inst.checked)state.tactics.instructions=state.tactics.instructions.filter(x=>x!==key);if(match?.active)match.tacticsSnapshot=mrV12Tactics();save();return;}
 const el=e.target.closest('[data-mr-tactic]');if(!el)return;
 const k=el.dataset.mrTactic;state.tactics=state.tactics||{};
 state.tactics[k]=el.value;
 if(k==='mentality'){state.style=el.value;match.style=el.value;}
 if(match?.active)match.tacticsSnapshot=mrV12Tactics();
 save();
});
function mrV12SimStatMinute(s,homeAttack,awayAttack,depth=0){
 const hpos=Math.max(25,Math.min(75,50+homeAttack-awayAttack+Math.random()*8-4));
 s.possessionHome+=hpos;s.possessionAway+=100-hpos;
 const hPass=2+Math.floor(Math.random()*5),aPass=2+Math.floor(Math.random()*5);
 s.passesHome+=hPass;s.passesAway+=aPass;
 s.accurateHome+=Math.round(hPass*(.72+Math.random()*.2));s.accurateAway+=Math.round(aPass*(.70+Math.random()*.2));
 if(Math.random()<homeAttack){s.shotsHome++;if(Math.random()<.42)s.onTargetHome++;}
 if(Math.random()<awayAttack){s.shotsAway++;if(Math.random()<.4)s.onTargetAway++;}
 if(Math.random()<.075)s.cornersHome++;if(Math.random()<.07)s.cornersAway++;
 if(Math.random()<.055)s.foulsHome++;if(Math.random()<.06)s.foulsAway++;
 if(Math.random()<(.02+Math.max(0,depth)*.012))s.offsidesHome++;if(Math.random()<.025)s.offsidesAway++;
}
const mrV12StartBase=startMatch;
startMatch=function(){
 mrV12StartBase();
 if(match?.active){
  match.stats=mrV12NewStats();match.finalStats=null;match.startingXI=(state.startingXI||[]).slice();
  match.tacticsSnapshot=mrV12Tactics();mrV12RenderMatchStats();mrV12ApplyTacticControls();
 }
};
const mrV12FinishBase=finishMatch;
finishMatch=function(){
 if(!match?.active)return;
 const won=match.home>match.away,level=(state.stadiumLevel||1)-1;
 match.finalStats=match.stats?JSON.parse(JSON.stringify(match.stats)):null;
 state.lastMatchStats=match.finalStats;
 const fatigued=new Set([...(match.startingXI||[]),...(state.startingXI||[])]);
 for(const id of fatigued){
  const wasStarter=(match.startingXI||[]).includes(id),old=MR_V12_SAFE_NUM(state.fitness[id],100),loss=wasStarter?Math.max(4,10-(match.subs||0)):4;
  state.fitness[id]=Math.max(35,old-loss);
  if(wasStarter)state.form[id]=Math.max(-5,Math.min(5,MR_V12_SAFE_NUM(state.form[id],0)+(won?1:-1)));
 }
 mrV12FinishBase();
 const baseReward=won?50000:10000,bonus=Math.round(baseReward*level*.02);
 if(bonus>0)state.coins+=bonus;
 save();updateWallet();mrV12RenderMatchStats();mrV12RenderStadium();
};
matchTick=function(){
 if(!match?.active||mrPause||mrBreak)return;
 const m=match,t=mrV12Tactics(),max=mrExtra?120:90;
 m.minute=Math.min(max,(Number(m.minute)||0)+1);
 if(!m.stats)m.stats=mrV12NewStats();
 const ids=(state.startingXI||[]),avg=ids.reduce((n,id)=>n+MR_V12_SAFE_NUM(playerById(id)?.ovr,50),0)/Math.max(1,ids.length);
 const fitness=ids.reduce((n,id)=>n+MR_V12_SAFE_NUM(state.fitness[id],100),0)/Math.max(1,ids.length);
 const chemistry=mrV12Chemistry(),form=ids.reduce((n,id)=>n+MR_V12_SAFE_NUM(state.form[id],0),0)/Math.max(1,ids.length);
 const mentality=t.mentality==='Атака'?3:t.mentality==='Оборона'?-3:0;
 const width=t.width==='Широкая'?2:t.width==='Узкая'?-1:0;
 const press=t.press==='Высокий'?2:t.press==='Низкий'?-1:0;
 const tempo=t.tempo==='Быстрый'?2:t.tempo==='Медленный'?-1:0;
 const pass=t.pass==='Короткий'?1:t.pass==='Длинный'?-1:0;
 const ins=t.instructions||[],instruction=(ins.includes('counter')?1.5:0)+(ins.includes('wing')?1:0)+(ins.includes('short')?1:0)+(ins.includes('press')?1.5:0),depth=t.depth==='Высокая'?1.5:t.depth==='Низкая'?-1:0;
 const fatiguePenalty=(100-fitness)*.035,difficulty=t.difficulty==='Любительская'?-2:t.difficulty==='Полупрофессиональная'?-1:t.difficulty==='Мировой класс'?2:0;
 const homeAttack=Math.max(.025,Math.min(.22,.085+(avg-70)*.002+mentality*.006+width*.003+tempo*.003+instruction*.003+depth*.0015-difficulty*.002-fatiguePenalty+(chemistry-50)*.0005+form*.002));
 const awayAttack=Math.max(.025,Math.min(.18,.078+(72-avg)*.0015+fatiguePenalty*.5));
 mrV12SimStatMinute(m.stats,homeAttack,awayAttack);
 let goalHome=false,goalAway=false;
 if(Math.random()<homeAttack*.42){m.home++;goalHome=true;addStat('goals');state.seasonXP=(Number(state.seasonXP)||0)+8;state.eventPoints=(Number(state.eventPoints)||0)+8;state.weeklyProgress.eventPoints=(Number(state.weeklyProgress.eventPoints)||0)+8;matchLog('ГОЛ! '+(state.club?.name||'MR FOOTBALL 27')+' забивает!');}
 else if(Math.random()<awayAttack*.40){m.away++;goalAway=true;matchLog('ГОЛ СОПЕРНИКА!');}
 else if(m.minute%7===0){matchLog(['Опасная атака!','Удар — вратарь спасает','Подача с фланга','Перехват в центре поля','Контратака после отбора','Команда разыгрывает короткий пас'][Math.floor(Math.random()*6)]);}
 if(m.minute%15===0&&t.press==='Высокий')matchLog('Высокий прессинг заставляет соперника ошибаться.');
 if(m.minute===45&&!mrExtra){mrBreak=true;clearInterval(m.timer);m.timer=null;matchLog('ПЕРЕРЫВ. Можно изменить схему, тактику и состав.');}
 else if(m.minute===90&&!mrExtra&&m.home===m.away){mrExtra=true;matchLog('Ничья после 90 минут. Дополнительное время до 120-й минуты.');}
 else if(m.minute>=max){
  if(mrExtra&&m.home===m.away){const a=3+Math.floor(Math.random()*3),b=3+Math.floor(Math.random()*3);m.penalties=[a,b];if(a===b){if(Math.random()<.5)m.home++;else m.away++;}else if(a>b)m.home++;else m.away++;matchLog(`Серия пенальти: ${a} — ${b}.`);}
  m._finalMinute=m.minute;finishMatch();return;
 }
 if(goalHome||goalAway){save();}
 v091RenderClock();const bar=$('#matchTimeline');if(bar)bar.style.width=(m.minute/(mrExtra?120:90)*100)+'%';
 mrPauseButton();mrV12RenderMatchStats();save();
};

/* Tournament match statistics and tactical controls. */
function mrV12TourneyStats(m){
 if(!m.stats)m.stats=mrV12NewStats();
 const t=mrV12Tactics(),h=mrV12PlayerStrength();
 const homeAttack=Math.max(.03,Math.min(.2,.08+(h-m.opponentRating)*.002+(t.mentality==='Атака'?.02:0)+(t.press==='Высокий'?.01:0)));
 const awayAttack=.075;
 mrV12SimStatMinute(m.stats,homeAttack,awayAttack);
}
const mrV12TournamentFinishBase=v10FinishRound;
v10FinishRound=function(){
 const m=v10TournamentMatch;
 if(m?.finished&&!m._v12Applied){
  m._v12Applied=true;state.lastTournamentStats=m.stats?JSON.parse(JSON.stringify(m.stats)):null;const won=m.winner==='home'||m.home>m.away;
  for(const id of (state.startingXI||[])){state.fitness[id]=Math.max(35,MR_V12_SAFE_NUM(state.fitness[id],100)-7);state.form[id]=Math.max(-5,Math.min(5,MR_V12_SAFE_NUM(state.form[id],0)+(won?1:-1)));}
 }
 mrV12TournamentFinishBase();
};

const mrV12TournamentStartBase=v10StartMatch;
v10StartMatch=function(){mrV12TournamentStartBase();if(v10TournamentMatch){v10TournamentMatch.stats=mrV12NewStats();v10TournamentMatch.subs=0;v10RenderMatch();}};
const mrV12TournamentTickBase=v10MatchTick;
v10MatchTick=function(){const m=v10TournamentMatch,before=m?.minute||0;mrV12TournamentTickBase();if(m&&m.minute>before){mrV12TourneyStats(m);if(m.finished){state.lastTournamentStats=m.stats;save();}v10RenderMatch();}};
const mrV12TournamentRenderBase=v10RenderMatch;
v10RenderMatch=function(){
 mrV12TournamentRenderBase();
 const m=v10TournamentMatch,box=$('#tournamentMatchPanel');
 const last=$('#mrV12TournamentLastStats');if(last)last.innerHTML='<strong>ПОСЛЕДНЯЯ СТАТИСТИКА ТУРНИРА</strong>'+mrV12StatsHTML(state.lastTournamentStats);
 if(!m||!box)return;
 const panel=document.createElement('div');panel.className='panel mr-v12-settings';panel.id='mrV12TournamentSettings';
 panel.innerHTML=`<strong>ТАКТИКА И СТАТИСТИКА ТУРНИРНОГО МАТЧА</strong><div class="mr-v12-settings-grid">
 <label>ШИРИНА<select data-mr-tactic="width"><option>Стандартная</option><option>Узкая</option><option>Широкая</option></select></label>
 <label>ГЛУБИНА<select data-mr-tactic="depth"><option>Средняя</option><option>Низкая</option><option>Высокая</option></select></label>
 <label>ПРЕССИНГ<select data-mr-tactic="press"><option>Средний</option><option>Низкий</option><option>Высокий</option></select></label>
 <label>ТЕМП<select data-mr-tactic="tempo"><option>Стандартный</option><option>Медленный</option><option>Быстрый</option></select></label>
 <label>ПЕРЕДАЧИ<select data-mr-tactic="pass"><option>Смешанный</option><option>Короткий</option><option>Длинный</option></select></label>
 </div><div class="mr-v12-instructions"><small>КОМАНДНЫЕ ИНСТРУКЦИИ</small><label><input type="checkbox" data-mr-instruction="counter"> Контратаки</label><label><input type="checkbox" data-mr-instruction="wing"> Игра через фланги</label><label><input type="checkbox" data-mr-instruction="short"> Короткий пас</label><label><input type="checkbox" data-mr-instruction="press"> Высокий прессинг</label></div>
 <button class="outline" id="mrV12TournamentApply">ПРИМЕНИТЬ ТАКТИКУ</button>
 <div class="mr-v12-settings-grid"><label>УХОДИТ<select id="mrV12SubOut">${(state.startingXI||[]).map((id,i)=>{const p=playerById(id);return `<option value="${i}">${escapeHTML(p.name)} · ${p.ovr}</option>`;}).join('')}</select></label>
 <label>ВЫХОДИТ<select id="mrV12SubIn">${(state.bench||[]).map(id=>{const p=playerById(id);return `<option value="${id}">${escapeHTML(p.name)} · ${p.ovr}</option>`;}).join('')}</select></label></div>
 <button class="outline" id="mrV12TournamentSub" ${m.subs>=5?'disabled':''}>СДЕЛАТЬ ЗАМЕНУ · ${m.subs||0}/5</button>
 <div class="mr-v12-stats"><strong>СТАТИСТИКА</strong>${mrV12StatsHTML(m.stats)}</div>`;
 box.appendChild(panel);mrV12ApplyTacticControls();
};
function mrV12PlayerStrength(){return (typeof v10PlayerStrength==='function'?v10PlayerStrength():60)+(mrV12Chemistry()-50)*.025;}
document.addEventListener('click',e=>{
 const ex=e.target.closest('[data-mr-exchange]');if(ex){e.preventDefault();e.stopImmediatePropagation();mrV12DoExchange(ex.dataset.mrExchange,Number(ex.dataset.offer)||0);return;}
 if(e.target.closest('#mrDailyClaim')){e.preventDefault();e.stopImmediatePropagation();mrV12ClaimDaily();return;}
 if(e.target.closest('#mrStadiumUpgrade')){e.preventDefault();e.stopImmediatePropagation();mrV12UpgradeStadium();return;}
 if(e.target.closest('#mrUpgradeButton')){e.preventDefault();e.stopImmediatePropagation();mrV12RankUp();return;}
 if(e.target.closest('#mrBuyTrainingToken')){e.preventDefault();e.stopImmediatePropagation();mrV12BuyTrainingToken();return;}
 if(e.target.closest('#mrV12TournamentApply')){e.preventDefault();e.stopImmediatePropagation();save();if(v10TournamentMatch)v10TournamentMatch.log.push('Тактические инструкции обновлены.');v10RenderMatch();toast('Тактика применена');return;}
 if(e.target.closest('#mrV12TournamentSub')){e.preventDefault();e.stopImmediatePropagation();const m=v10TournamentMatch;if(!m||m.finished||m.ready||m.subs>=5){toast('Замены сейчас недоступны');return;}const oi=Number($('#mrV12SubOut')?.value),ii=$('#mrV12SubIn')?.value,bi=state.bench.indexOf(ii);if(!ii||bi<0||!Number.isInteger(oi)){toast('Выбери игроков для замены');return;}const old=state.startingXI[oi];if(!old){toast('Игрок не найден');return;}state.startingXI[oi]=ii;state.bench[bi]=old;m.subs++;state.fitness[old]=Math.max(35,MR_V12_SAFE_NUM(state.fitness[old],100)-8);state.fitness[ii]=Math.max(50,MR_V12_SAFE_NUM(state.fitness[ii],100));m.log.push(`Замена: ${playerById(ii).name} вместо ${playerById(old).name}.`);save();drawSquad();updateOverall();v10RenderMatch();toast(`Замена выполнена · ${m.subs}/5`);return;}
},true);
document.addEventListener('change',e=>{if(e.target.id==='mrUpgradePlayer')mrV12RenderUpgradePreview();});
const mrV12NavigateBase=navigate;
navigate=function(page){
 mrV12NavigateBase(page);
 const names={exchanges:'ОБМЕНЫ',development:'УЛУЧШЕНИЕ',stadium:'СТАДИОН',daily:'ЕЖЕДНЕВНЫЕ НАГРАДЫ'};
 if(names[page]&&$('#crumb'))$('#crumb').textContent=names[page];
 if(page==='exchanges')mrV12RenderExchanges();
 if(page==='development')mrV12RenderDevelopment();
 if(page==='stadium')mrV12RenderStadium();
 if(page==='daily')mrV12RenderDaily();
 if(page==='match'||page==='squad'){mrV12ApplyTacticControls();if(page==='match')mrV12RenderMatchStats();}
};

$('#mrUpgradePlayer')?.addEventListener('change',mrV12RenderUpgradePreview);
$('#mrDailyClaim')?.addEventListener('click',mrV12ClaimDaily);
$('#mrStadiumUpgrade')?.addEventListener('click',mrV12UpgradeStadium);

/* Remove old event-pass guaranteed player drops. */
if(Array.isArray(passRewards))passRewards.forEach(r=>{if(r.type==='eventPlayer'){r.type='eventTokens';r.label='100 жетонов события';r.amount=100;}});
if(Array.isArray(FCUC_V06_PASS_REWARDS))FCUC_V06_PASS_REWARDS.forEach(r=>{if(r[1]==='player'){r[0]='Жетоны события';r[1]='tokens';r[2]=120;}});if(typeof renderPassV06==='function')renderPassV06();

document.addEventListener('click',e=>{if(!e.target.closest('#exportSave'))return;e.preventDefault();e.stopImmediatePropagation();save();const payload={game:'MR FOOTBALL 27',version:'1.3',schemaVersion:MR_V12_SCHEMA,exportedAt:new Date().toISOString(),state};const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='MR_FOOTBALL_27_Save_v1.3.json';document.body.append(a);a.click();a.remove();URL.revokeObjectURL(url);toast('Резервная копия сохранения v1.3 подготовлена');},true);
if(typeof v09RenderNY==='function')v09RenderNY();if(typeof renderPassV06==='function')renderPassV06();

/* Update club branding and keep all legacy pages/features. */
document.title='MR FOOTBALL 27 · v1.2';
const mrV12Brand=document.querySelector('.brand');if(mrV12Brand){const b=mrV12Brand.querySelector('b'),s=mrV12Brand.querySelector('small');if(b)b.textContent='MR FOOTBALL 27';if(s)s.textContent='VERSION 1.2';}
mrV12InjectMarket();mrV12ApplyTacticControls();mrV12RenderDaily();mrV12RenderExchanges();mrV12RenderDevelopment();mrV12RenderStadium();updateOverall();mrV12RenderMatchStats();save();

$('#matchStyle')?.addEventListener('change',e=>{state.tactics=state.tactics||{};state.tactics.mentality=e.target.value;save();});
[['#tacticWidth','width'],['#tacticPress','press'],['#tacticLine','depth'],['#tacticBuild','pass'],['#tacticMentality','mentality']].forEach(([sel,key])=>$(sel)?.addEventListener('change',e=>{state.tactics=state.tactics||{};state.tactics[key]=e.target.value;if(key==='mentality')state.style=e.target.value;save();}));

/* ================= END MR FOOTBALL 27 v1.2 ================= */

/* ================= MR FOOTBALL 27 v1.3 PATCH ================= */
const MR_V13_START_DATE='2026-12-10';
const mrV13Today=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};
const mrV13NYOpen=()=>mrV13Today()>=MR_V13_START_DATE;

// Training token: 150 coins per token (not 20,000).
mrV12BuyTrainingToken=function(){
 const cost=150;
 if((Number(state.coins)||0)<cost){toast('Нужно 150 монет');return;}
 state.coins-=cost;state.trainingTokens=(Number(state.trainingTokens)||0)+1;
 save();updateWallet();mrV12RenderDevelopment();toast('Получен 1 жетон улучшения · −150 монет');
};

// Exchanges now consume four distinct non-starter players with tiered minimum OVR.
const MR_V13_EXCHANGE_RULES={
 normal:{min:75,max:82,requirements:[75,70,69],coins:25000,label:'ОБЫЧНЫЙ ОБМЕН'},
 advanced:{min:83,max:87,requirements:[82,80,78],coins:60000,label:'ПРОДВИНУТЫЙ ОБМЕН'},
 elite:{min:88,max:91,requirements:[86,84,82],coins:120000,label:'ЭЛИТНЫЙ ОБМЕН'}
};
MR_V12_EXCHANGE_RULES.normal={...MR_V13_EXCHANGE_RULES.normal,fodder:69,count:4};
MR_V12_EXCHANGE_RULES.advanced={...MR_V13_EXCHANGE_RULES.advanced,fodder:75,count:4};
MR_V12_EXCHANGE_RULES.elite={...MR_V13_EXCHANGE_RULES.elite,fodder:80,count:4};
function mrV13ReqText(tier){return MR_V13_EXCHANGE_RULES[tier].requirements.map((v,i)=>`${i+1}: ${v}+`).join(' · ');}
const mrV13RenderExchangesBase=mrV12RenderExchanges;
mrV12RenderExchanges=function(){
 const ids=['mrFodder1','mrFodder2','mrFodder3'];
 for(let i=0;i<ids.length;i++){
  const el=$('#'+ids[i]);if(!el)continue;const old=el.value;
  const min=Math.min(...Object.values(MR_V13_EXCHANGE_RULES).map(r=>r.requirements[i]));
  el.innerHTML=mrV12Options(min,`Игрок ${i+1} · ${min}+`,old);
 }
 mrV13RenderExchangesBase();
 for(const tier of Object.keys(MR_V13_EXCHANGE_RULES)){
  const box=$('#mrExchange'+tier[0].toUpperCase()+tier.slice(1));if(!box)continue;
  box.querySelectorAll('.mr-v12-exchange-card').forEach(card=>{
   const small=card.querySelector('small');if(small)small.textContent=`Требуются 3 игрока: ${mrV13ReqText(tier)} · ${fmt(MR_V13_EXCHANGE_RULES[tier].coins)} монет`;
  });
 }
};
const mrV13DoExchangeBase=mrV12DoExchange;
mrV12DoExchange=function(tier,index=0){
 if(!MR_V13_EXCHANGE_RULES[tier])return mrV13DoExchangeBase(tier,index);
 const rule=MR_V13_EXCHANGE_RULES[tier],ids=['mrFodder1','mrFodder2','mrFodder3'].map(id=>$('#'+id)?.value||'');
 if(ids.some(x=>!x)||new Set(ids).size!==3){toast('Выбери трёх разных игроков');return;}
 const fodder=ids.map(id=>state.players.find(p=>p.id===id));
 if(fodder.some((p,i)=>!p||Number(p.ovr)<rule.requirements[i]||(state.startingXI||[]).includes(p.id))){toast(`Условия: ${mrV13ReqText(tier)}. Стартовый состав сдавать нельзя.`);return;}
 if((Number(state.coins)||0)<rule.coins){toast(`Нужно ${fmt(rule.coins)} монет`);return;}
 const targetId=state.exchangeOffers?.[tier]?.[index];
 const pool=FCUC_PLAYER_DB.filter(p=>p.ovr>=rule.min&&p.ovr<=rule.max&&!fcucOwned(p.name));
 const target=pool.find(p=>p.id===targetId)||pool[Math.floor(Math.random()*pool.length)];
 if(!target){toast('Нет доступных карточек для обмена');return;}
 state.coins-=rule.coins;mrV12ConsumeFodder(ids);
 const added=mrV12AddRewardCard(target,tier);if(!added){toast('Эта карточка уже есть в клубе');return;}
 state.exchangeOffers[tier]=null;save();updateWallet();drawSquad();if(typeof renderReserve==='function')renderReserve();mrV12RenderExchanges();updateOverall();
 modal('ОБМЕН УСПЕШЕН',`Получен ${target.name} · ${target.ovr} OVR. Списаны 3 игрока и ${fmt(rule.coins)} монет.`);
};

// Ensure winter event cards are injected into the normal transfer market immediately.
const mrV13InjectMarketBase=mrInjectEventMarket;
mrInjectEventMarket=function(){
 mrV13InjectMarketBase();if(!Array.isArray(state.market))state.market=[];
 const seen=new Set(state.market.map(p=>fcucNameKey(p.name)));
 for(const p of (FCUC_EVENT_DB||[])){
  if(!p||fcucOwned(p.name)||seen.has(fcucNameKey(p.name)))continue;
  const base=Number(p.price)||fcucValue(Number(p.ovr)||70);
  state.market.push({...p,id:`winter-transfer-${p.id}`,eventGroup:'winter',eventTransfer:true,price:Math.max(25000,Math.round(base*1.28/5000)*5000)});
  seen.add(fcucNameKey(p.name));
 }
 // New Year cards are deliberately absent before 10 December.
 if(!mrV13NYOpen())state.market=state.market.filter(p=>p.eventGroup!=='newyear'&&p.event!=='newyear'&&!String(p.id||'').includes('ny27_'));
 else {
  const names=new Set(state.market.map(p=>fcucNameKey(p.name)));
  for(const p of (MR_V12_NEWYEAR_DB||[]))if(!fcucOwned(p.name)&&!names.has(fcucNameKey(p.name))){const base=Number(p.price)||fcucValue(Number(p.ovr)||75);state.market.push({...p,id:`ny-transfer-${p.id}`,eventGroup:'newyear',eventTransfer:true,price:Math.max(25000,Math.round(base*1.28/5000)*5000)});names.add(fcucNameKey(p.name));}
 }
};

// Winter match: open the match room in a prepared state; kickoff is manual.
playEventMatch=function(){
 if(typeof fcucV07RefreshCycles==='function')fcucV07RefreshCycles();
 if((Number(state.eventMatchesToday)||0)>=3){toast('Лимит зимних матчей на сегодня исчерпан. Новые матчи будут доступны после 00:00.');return;}
 if(match?.active){toast('Сначала заверши текущий матч');return;}
 clearInterval(match?.timer);
 match={active:false,minute:0,home:0,away:0,subs:0,log:[],timer:null,style:state.style||'Баланс',formation:state.formation||'4-3-3',mode:'event',_eventPrepared:true,stats:mrV12NewStats(),startingXI:(state.startingXI||[]).slice()};
 mrPause=false;mrBreak=false;mrExtra=false;
 navigate('match');
 const score=$('#score');if(score)score.textContent='WINTER WUNDERKIND · ГОТОВ К СТАРТУ';
 const log=$('#matchLog');if(log)log.innerHTML='<div>Зимний матч подготовлен. Настрой схему, состав и тактику, затем нажми «НАЧАТЬ МАТЧ».</div>';
 const start=$('#matchStart');if(start){start.disabled=false;start.textContent='НАЧАТЬ МАТЧ';}
 const end=$('#matchEnd');if(end)end.disabled=true;
 mrPauseButton();renderMatchSetup();mrV12ApplyTacticControls();save();
};
const mrV13StartMatchBase=startMatch;
startMatch=function(){
 const eventKickoff=match?.mode==='event'&&match?._eventPrepared;
 mrV13StartMatchBase();
 if(eventKickoff&&match?.active){match.mode='event';match._eventPrepared=false;match._eventCounted=false;match._newYearPassAwarded=false;match.startingXI=(state.startingXI||[]).slice();fcucV07SetOpponent();const score=$('#score');if(score)score.textContent='WINTER WUNDERKIND · LIVE';save();}
};
// Intercept the kickoff only for the prepared winter match; regular matches retain their existing flow.
document.addEventListener('click',e=>{
 const b=e.target.closest('#matchStart');if(b&&match?.mode==='event'&&match?._eventPrepared){e.preventDefault();e.stopImmediatePropagation();startMatch();}
},true);

// Count one completed winter match exactly once and display remaining attempts clearly.
const mrV13FinishMatchBase=finishMatch;
finishMatch=function(){
 if(!match?.active||match._finished||match._finishing)return;
 const isWinter=match.mode==='event';let day=mrV13Today();
 if(isWinter){if(state.eventMatchDate!==day){state.eventMatchDate=day;state.eventMatchesToday=0;}if(match._eventCounted)return;}
 const before=Number(state.eventMatchesToday)||0;
 mrV13FinishMatchBase();
 if(isWinter){state.eventMatchesToday=Math.min(3,before+1);state.eventMatchDate=day;match._eventCounted=true;}
 if(!match._newYearPassAwarded){state.newYearPass=state.newYearPass||{xp:0,claimed:[]};state.newYearPass.xp=(Number(state.newYearPass.xp)||0)+35;match._newYearPassAwarded=true;}
 const left=Math.max(0,3-(Number(state.eventMatchesToday)||0));const b=$('#eventMatchPlay');if(b){b.disabled=left===0;b.textContent=left===0?'ЛИМИТ НА СЕГОДНЯ ИСЧЕРПАН':`НАЧАТЬ ЗИМНИЙ МАТЧ · ОСТАЛОСЬ ${left} ИЗ 3`;}
 save();mrV13RenderNewYearPass();
};
function mrV13UpdateWinterCounter(){if(typeof fcucV07RefreshCycles==='function')fcucV07RefreshCycles();const left=Math.max(0,3-(Number(state.eventMatchesToday)||0));const b=$('#eventMatchPlay');if(b){b.disabled=left===0;b.textContent=left===0?'ЛИМИТ НА СЕГОДНЯ ИСЧЕРПАН':`НАЧАТЬ ЗИМНИЙ МАТЧ · ОСТАЛОСЬ ${left} ИЗ 3`;}}

// Independent five-level New Year pass, locked until 10 December 2026.
const MR_V13_NY_REWARDS=[
 {xp:100,label:'3 000 монет',type:'coins',amount:3000},
 {xp:250,label:'10 самоцветов',type:'gems',amount:10},
 {xp:450,label:'20 жетонов события',type:'tokens',amount:20},
 {xp:700,label:'8 000 монет',type:'coins',amount:8000},
 {xp:1000,label:'25 самоцветов + 35 жетонов события',type:'bundle',gems:25,tokens:35}
];
function mrV13RenderNewYearPass(){
 const box=$('#nyPassRewards');if(!box)return;
 state.newYearPass=state.newYearPass||{xp:0,claimed:[]};const p=state.newYearPass,xp=Number(p.xp)||0,open=mrV13NYOpen();
 const status=$('#nyPassStatus'),hint=$('#nyPassHint'),xpEl=$('#nyPassXP'),bar=$('#nyPassBar');
 if(status)status.textContent=open?'НОВОГОДНИЙ ПАС ОТКРЫТ':'ОТКРОЕТСЯ 10 ДЕКАБРЯ 2026';
 if(hint)hint.textContent=open?`Твой прогресс: ${xp} XP. Получай 35 XP за каждый завершённый матч.`:'Пас пока закрыт. С 10 декабря можно будет зарабатывать XP и получать пять наград.';
 if(xpEl)xpEl.textContent=String(xp);if(bar)bar.style.width=Math.min(100,xp/1000*100)+'%';
 box.innerHTML=MR_V13_NY_REWARDS.map((r,i)=>{const claimed=(p.claimed||[]).includes(i),ready=open&&xp>=r.xp&&!claimed;return `<article class="pass-reward"><div class="reward-level">${i+1}</div><b>${r.label}</b><small>${r.xp} XP</small><button class="primary" data-ny-pass-claim="${i}" ${ready?'':'disabled'}>${claimed?'ПОЛУЧЕНО':ready?'ЗАБРАТЬ':'ЗАКРЫТО'}</button></article>`;}).join('');
}
function mrV13ClaimNewYearPass(i){
 if(!mrV13NYOpen()){toast('Новогодний пас откроется 10 декабря');return;}
 const r=MR_V13_NY_REWARDS[i];if(!r)return;state.newYearPass=state.newYearPass||{xp:0,claimed:[]};
 if((state.newYearPass.claimed||[]).includes(i)||Number(state.newYearPass.xp)<r.xp){toast('Пока недостаточно XP');return;}
 if(i===4){state.gems=(Number(state.gems)||0)+r.gems;state.eventTokens=(Number(state.eventTokens)||0)+r.tokens;}
 else if(r.type==='coins')state.coins=(Number(state.coins)||0)+r.amount;
 else if(r.type==='gems')state.gems=(Number(state.gems)||0)+r.amount;
 else if(r.type==='tokens')state.eventTokens=(Number(state.eventTokens)||0)+r.amount;
 state.newYearPass.claimed.push(i);save();updateWallet();mrV13RenderNewYearPass();toast('Награда новогоднего паса получена!');
}
document.addEventListener('click',e=>{const b=e.target.closest('[data-ny-pass-claim]');if(b){e.preventDefault();e.stopImmediatePropagation();mrV13ClaimNewYearPass(Number(b.dataset.nyPassClaim));}},true);
const mrV13NavigateBase=navigate;
navigate=function(page){mrV13NavigateBase(page);if(page==='newyearpass'){if($('#crumb'))$('#crumb').textContent='НОВОГОДНИЙ ПАС';mrV13RenderNewYearPass();}if(page==='event')mrV13UpdateWinterCounter();};

// Migrate old saves without resetting any existing progression.
state.newYearPass=state.newYearPass&&typeof state.newYearPass==='object'?state.newYearPass:{xp:0,claimed:[]};
state.newYearPass.xp=Number(state.newYearPass.xp)||0;state.newYearPass.claimed=Array.isArray(state.newYearPass.claimed)?state.newYearPass.claimed:[];
const mrV13Brand=document.querySelector('.brand');if(mrV13Brand){const b=mrV13Brand.querySelector('b'),v=mrV13Brand.querySelector('small');if(b)b.textContent='MR FOOTBALL 27';if(v)v.textContent='VERSION 1.3';}
document.title='MR FOOTBALL 27 · v1.3';
mrV13InjectMarketBase();mrV13RenderExchanges();mrV13RenderNewYearPass();mrV13UpdateWinterCounter();save();
/* ================= END MR FOOTBALL 27 v1.3 PATCH ================= */


/* ================= MR FOOTBALL 27 v1.4 HOTFIX ================= */
// v1.4: strict economy, real tier validation, event-card variants and reliable winter match accounting.
const MR_V14_TEST_MODE=!!state.newYearTestMode;
const mrV14Today=()=>typeof fcucV07DateKey==='function'?fcucV07DateKey():new Date().toISOString().slice(0,10);
const mrV14NYOpen=()=>mrV14Today()>='2026-12-10'||!!state.newYearTestMode;

// One training token costs 200,000 coins, as agreed.
mrV12BuyTrainingToken=function(){
 const cost=200000;
 if((Number(state.coins)||0)<cost){toast('Для покупки жетона нужно 200 000 монет');return;}
 state.coins-=cost;state.trainingTokens=(Number(state.trainingTokens)||0)+1;
 save();updateWallet();mrV12RenderDevelopment();toast('Куплен 1 жетон улучшения · −200 000 монет');
};

// Exact requirements: each slot has its own minimum OVR. Never rely on the display text.
const MR_V14_EXCHANGE_RULES={
 normal:{min:75,max:82,requirements:[75,70,69],coins:25000,label:'ОБЫЧНЫЙ ОБМЕН'},
 advanced:{min:83,max:87,requirements:[82,80,78],coins:60000,label:'ПРОДВИНУТЫЙ ОБМЕН'},
 elite:{min:88,max:91,requirements:[86,84,82],coins:120000,label:'ЭЛИТНЫЙ ОБМЕН'}
};
function mrV14ReqText(tier){return MR_V14_EXCHANGE_RULES[tier].requirements.map((v,i)=>`игрок ${i+1}: ${v}+`).join(' · ');}
function mrV14ExchangeOptions(selected){
 const rows=(state.players||[]).filter(p=>!(state.startingXI||[]).includes(p.id)&&Number(p.ovr)>=69);
 return '<option value="">Выбери игрока (условия зависят от обмена)</option>'+rows.map(p=>`<option value="${escapeHTML(p.id)}" ${p.id===selected?'selected':''}>${escapeHTML(p.name)} · ${p.ovr} OVR</option>`).join('');
}
const mrV14RenderExchangesBase=mrV12RenderExchanges;
mrV12RenderExchanges=function(){
 // The old renderer resets all selectors to 60+; render first, then rebuild them with 69+ options.
 mrV14RenderExchangesBase();
 for(let i=1;i<=3;i++){
  const el=$(`#mrFodder${i}`);if(!el)continue;const old=el.value;
  el.innerHTML=mrV14ExchangeOptions(old);
 }
 for(const tier of Object.keys(MR_V14_EXCHANGE_RULES)){
  const box=$(`#mrExchange${tier[0].toUpperCase()+tier.slice(1)}`);if(!box)continue;
  box.querySelectorAll('.mr-v12-exchange-card').forEach(card=>{
   const small=card.querySelector('small');if(small)small.textContent=`Требования: ${mrV14ReqText(tier)} · ${fmt(MR_V14_EXCHANGE_RULES[tier].coins)} монет`;
  });
 }
 if(state.newYearTestMode){const ny=$('#mrExchangeNewYear');if(ny){const pool=MR_V12_NEWYEAR_DB.filter(p=>p.ovr>=75&&p.ovr<=80&&!fcucOwned(p.name));ny.innerHTML=pool.length?`<button class=\"primary\" data-mr-exchange=\"newyear\">ТЕСТОВЫЙ ОБМЕН NEW YEAR · 150 ЖЕТОНОВ</button><small class=\"muted\">Тестовый доступ включён. Требуются игроки 75+ и 70+.</small>`:'<p class=\"muted\">Все новогодние карточки уже собраны.</p>';}}
};
const mrV14ConsumeExchangeBase=mrV12DoExchange;
mrV12DoExchange=function(tier,index=0){
 const rule=MR_V14_EXCHANGE_RULES[tier];
 if(!rule&&tier==='newyear'&&state.newYearTestMode){
  const ids=['mrNewYearFodder1','mrNewYearFodder2'].map(id=>$('#'+id)?.value||'');
  if(ids.some(x=>!x)||ids[0]===ids[1]){toast('Выбери двух разных игроков');return;}
  const fodder=ids.map(id=>(state.players||[]).find(p=>p.id===id));
  if(fodder.some((p,i)=>!p||Number(p.ovr)<(i===0?75:70)||(state.startingXI||[]).includes(p.id))){toast('Условия тестового обмена: один игрок 75+ и один игрок 70+');return;}
  if((Number(state.newYearTokens)||0)<150){toast('Нужно 150 жетонов New Year');return;}
  const pool=MR_V12_NEWYEAR_DB.filter(p=>p.ovr>=75&&p.ovr<=80&&!fcucOwned(p.name));const target=pool[Math.floor(Math.random()*pool.length)];
  if(!target){toast('Нет доступных новогодних карточек');return;}
  state.newYearTokens-=150;mrV12ConsumeFodder(ids);const added=mrV12AddRewardCard(target,'newyear');
  if(!added){state.newYearTokens+=150;toast('Карточка не добавлена; жетоны возвращены.');return;}
  save();updateWallet();drawSquad();if(typeof renderReserve==='function')renderReserve();mrV12RenderExchanges();updateOverall();modal('ТЕСТОВЫЙ ОБМЕН',`Получен ${target.name} · ${target.ovr} OVR.`);return;
 }
 if(!rule)return mrV14ConsumeExchangeBase(tier,index);
 const ids=['mrFodder1','mrFodder2','mrFodder3'].map(id=>$('#'+id)?.value||'');
 if(ids.some(x=>!x)||new Set(ids).size!==3){toast('Выбери трёх разных игроков');return;}
 const fodder=ids.map(id=>(state.players||[]).find(p=>p.id===id));
 if(fodder.some((p,i)=>!p||Number(p.ovr)<rule.requirements[i]||(state.startingXI||[]).includes(p.id))){toast(`Условия обмена: ${mrV14ReqText(tier)}. Стартовых игроков сдавать нельзя.`);return;}
 if((Number(state.coins)||0)<rule.coins){toast(`Для обмена нужно ${fmt(rule.coins)} монет`);return;}
 const targetId=state.exchangeOffers?.[tier]?.[index];
 const pool=FCUC_PLAYER_DB.filter(p=>p.ovr>=rule.min&&p.ovr<=rule.max&&!fcucOwned(p.name));
 const target=pool.find(p=>p.id===targetId)||pool[Math.floor(Math.random()*pool.length)];
 if(!target){toast('Нет доступных карточек этого рейтинга');return;}
 // Deduct only after a valid reward is guaranteed.
 if(fcucOwned(target.name)){toast('Эта карточка уже есть в клубе. Обнови предложения обмена.');return;}
 state.coins-=rule.coins;mrV12ConsumeFodder(ids);
 const added=mrV12AddRewardCard(target,tier);
 if(!added){state.coins+=rule.coins;toast('Не удалось добавить карточку; монеты возвращены.');return;}
 state.exchangeOffers[tier]=null;save();updateWallet();drawSquad();if(typeof renderReserve==='function')renderReserve();mrV12RenderExchanges();updateOverall();
 modal('ОБМЕН УСПЕШЕН',`Получен ${target.name} · ${target.ovr} OVR. Списаны три игрока (${rule.requirements.join('/')}+) и ${fmt(rule.coins)} монет.`);
};

// Add winter event card versions even when the regular version of the same footballer is listed.
// De-duplicate by event-card ID, not by player name (base and event versions are different cards).
const mrV14InjectMarketBase=mrInjectEventMarket;
mrInjectEventMarket=function(){
 mrV14InjectMarketBase();if(!Array.isArray(state.market))state.market=[];
 const winterIds=new Set((FCUC_EVENT_DB||[]).map(p=>String(p.id)));
 for(const item of state.market){
  const raw=String(item.id||'');
  const match=[...winterIds].find(id=>raw===`evtmarket_${id}`||raw===`winter-transfer-${id}`||raw===`mr14-winter-${id}`);
  if(match){item.eventGroup='winter';item.event='winter';item.eventTransfer=true;}
 }
 const present=new Set(state.market.filter(p=>p.eventGroup==='winter').map(p=>String(p.eventSourceId||p.id)));
 for(const p of (FCUC_EVENT_DB||[])){
  if(!p||present.has(String(p.id)))continue;
  const base=Number(p.price)||fcucValue(Number(p.ovr)||70);
  state.market.push({...p,id:`mr14-winter-${p.id}`,eventSourceId:p.id,eventGroup:'winter',event:'winter',eventTransfer:true,type:'event-transfer',price:Math.max(25000,Math.round(base*1.28/5000)*5000)});
  present.add(String(p.id));
 }
 // New Year cards are kept hidden in normal saves until 10 Dec; test saves can preview them.
 if(!mrV14NYOpen()){
  state.market=state.market.filter(p=>p.eventGroup!=='newyear'&&p.event!=='newyear'&&!String(p.id||'').includes('ny_evt_')&&!String(p.id||'').includes('ny27_'));
 }else{
  const ids=new Set(state.market.filter(p=>p.eventGroup==='newyear').map(p=>String(p.eventSourceId||p.id)));
  for(const p of (MR_V12_NEWYEAR_DB||[])){
   if(ids.has(String(p.id)))continue;
   const base=Number(p.price)||fcucValue(Number(p.ovr)||75);
   state.market.push({...p,id:`mr14-newyear-${p.id}`,eventSourceId:p.id,eventGroup:'newyear',event:'newyear',eventTransfer:true,price:Math.max(25000,Math.round(base*1.28/5000)*5000)});
   ids.add(String(p.id));
  }
 }
};
// Render the selected event subset through the original card renderer, then restore the complete market.
const mrV14MarketRenderBase=mrV12MarketRenderBase;
renderMarket=function(){
 mrInjectEventMarket();
 const all=state.market,ev=$('#marketEventFilter')?.value||'all',sort=$('#marketSort')?.value||'rating-desc';
 let data=all.filter(p=>ev==='all'||(ev==='base'?(p.eventGroup==='base'||!p.eventGroup):p.eventGroup===ev));
 data=data.slice().sort((a,b)=>sort==='rating-asc'?(+a.ovr||0)-(+b.ovr||0):sort==='price-asc'?(+a.price||0)-(+b.price||0):sort==='price-desc'?(+b.price||0)-(+a.price||0):(+b.ovr||0)-(+a.ovr||0));
 state.market=data;mrV14MarketRenderBase();state.market=all;
 const count=$('#marketCount');if(count)count.textContent=`Найдено карточек: ${data.length}`;
};
$('#marketEventFilter')?.addEventListener('change',renderMarket);
$('#marketSort')?.addEventListener('change',renderMarket);

// The winter match only consumes one of the three daily attempts after a real completed match.
const mrV14PlayWinterBase=playEventMatch;
playEventMatch=function(){
 if(typeof fcucV07RefreshCycles==='function')fcucV07RefreshCycles();
 if((Number(state.eventMatchesToday)||0)>=3){toast('Лимит зимних матчей на сегодня исчерпан.');return;}
 if(match?.active){toast('Сначала заверши текущий матч');return;}
 mrV14PlayWinterBase();
};
const mrV14StartBase=startMatch;
startMatch=function(){
 const prepared=match?.mode==='event'&&match?._eventPrepared;
 mrV14StartBase();
 if(prepared&&match?.active){match.mode='event';match._eventPrepared=false;match._mr14Counted=false;match._eventCounted=false;match._finished=false;match._finishing=false;match.startingXI=(state.startingXI||[]).slice();if(typeof fcucV07SetOpponent==='function')fcucV07SetOpponent();save();}
};
const mrV14FinishBase=finishMatch;
finishMatch=function(){
 if(!match?.active||match._finished||match._finishing)return;
 const isWinter=match.mode==='event';
 const day=mrV14Today();
 let before=Number(state.eventMatchesToday)||0;
 if(isWinter){if(state.eventMatchDate!==day)before=0;if(match._mr14Counted)return;}
 mrV14FinishBase();
 if(isWinter){
  // Older finish handlers also increment this field; normalize to exactly one completed match.
  state.eventMatchDate=day;state.eventMatchesToday=Math.min(3,before+1);match._mr14Counted=true;match._eventCounted=true;
  const left=Math.max(0,3-state.eventMatchesToday),b=$('#eventMatchPlay');
  if(b){b.disabled=left===0;b.textContent=left===0?'ЛИМИТ НА СЕГОДНЯ ИСЧЕРПАН':`НАЧАТЬ ЗИМНИЙ МАТЧ · ОСТАЛОСЬ ${left} ИЗ 3`;}
  if(typeof renderEventMode==='function')renderEventMode();
  if(b){const left2=Math.max(0,3-state.eventMatchesToday);b.disabled=left2===0;b.textContent=left2===0?'ЛИМИТ НА СЕГОДНЯ ИСЧЕРПАН':`НАЧАТЬ ЗИМНИЙ МАТЧ · ОСТАЛОСЬ ${left2} ИЗ 3`;}
  save();
 }
};

// New Year pass test switch: regular saves stay date-locked; the separate test save opts in.
mrV13RenderNewYearPass=function(){
 const box=$('#nyPassRewards');if(!box)return;
 state.newYearPass=state.newYearPass||{xp:0,claimed:[]};
 const p=state.newYearPass,xp=Number(p.xp)||0,open=mrV14NYOpen();
 const status=$('#nyPassStatus'),hint=$('#nyPassHint'),xpEl=$('#nyPassXP'),bar=$('#nyPassBar');
 if(status)status.textContent=open?(state.newYearTestMode?'ТЕСТОВЫЙ ДОСТУП ОТКРЫТ':'НОВОГОДНИЙ ПАС ОТКРЫТ'):'ОТКРОЕТСЯ 10 ДЕКАБРЯ 2026';
 if(hint)hint.textContent=open?`Твой прогресс: ${xp} XP. Получай 35 XP за каждый завершённый матч.`:'Пас пока закрыт. С 10 декабря можно будет зарабатывать XP и получать пять наград.';
 if(xpEl)xpEl.textContent=String(xp);if(bar)bar.style.width=Math.min(100,xp/1000*100)+'%';
 box.innerHTML=MR_V13_NY_REWARDS.map((r,i)=>{const claimed=(p.claimed||[]).includes(i),ready=open&&xp>=r.xp&&!claimed;return `<article class=\"pass-reward\"><div class=\"reward-level\">${i+1}</div><b>${r.label}</b><small>${r.xp} XP</small><button class=\"primary\" data-ny-pass-claim=\"${i}\" ${ready?'':'disabled'}>${claimed?'ПОЛУЧЕНО':ready?'ЗАБРАТЬ':'ЗАКРЫТО'}</button></article>`;}).join('');
};
mrV13ClaimNewYearPass=function(i){
 if(!mrV14NYOpen()){toast('Новогодний пас откроется 10 декабря');return;}
 const r=MR_V13_NY_REWARDS[i];if(!r)return;state.newYearPass=state.newYearPass||{xp:0,claimed:[]};
 if((state.newYearPass.claimed||[]).includes(i)||Number(state.newYearPass.xp)<r.xp){toast('Пока недостаточно XP');return;}
 if(i===4){state.gems=(Number(state.gems)||0)+r.gems;state.eventTokens=(Number(state.eventTokens)||0)+r.tokens;}
 else if(r.type==='coins')state.coins=(Number(state.coins)||0)+r.amount;
 else if(r.type==='gems')state.gems=(Number(state.gems)||0)+r.amount;
 else if(r.type==='tokens')state.eventTokens=(Number(state.eventTokens)||0)+r.amount;
 state.newYearPass.claimed.push(i);save();updateWallet();mrV13RenderNewYearPass();toast('Награда новогоднего паса получена!');
};

// Keep the test-mode switch and event counters stable through save migration.
state.newYearTestMode=!!state.newYearTestMode;
state.eventMatchesToday=Number(state.eventMatchesToday)||0;
state.eventMatchDate=state.eventMatchDate||mrV14Today();
const mrV14Brand=document.querySelector('.brand');if(mrV14Brand){const b=mrV14Brand.querySelector('b'),v=mrV14Brand.querySelector('small');if(b)b.textContent='MR FOOTBALL 27';if(v)v.textContent='VERSION 1.4';}
document.title='MR FOOTBALL 27 · v1.4';
mrInjectEventMarket();mrV12RenderExchanges();mrV13RenderNewYearPass();mrV13UpdateWinterCounter();save();
/* ================= END MR FOOTBALL 27 v1.4 HOTFIX ================= */

})();