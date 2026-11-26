const aliases={
'Alžírsko':'Algeria','Angola':'Angola','Benin':'Benin','Botswana':'Botswana','Burkina Faso':'Burkina Faso','Burundi':'Burundi','Čad':'Chad','Dem. rep. Kongo':'Democratic Republic of the Congo','Džibutsko':'Djibouti','Egypt':'Egypt','Eritrea':'Eritrea','Etiopie':'Ethiopia','Gabon':'Gabon','Gambie':'Gambia','Ghana':'Ghana','Guinea':'Guinea','Guinea-Bissau':'Guinea-Bissau','Jihoafrická rep.':'South Africa','Kamerun':'Cameroon','Keňa':'Kenya','Komory':'Comoros','Konžská republika':'Republic of the Congo','Lesotho':'Lesotho','Libérie':'Liberia','Libye':'Libya','Madagaskar':'Madagascar','Malawi':'Malawi','Mali':'Mali','Maroko':'Morocco','Mauricius':'Mauritius','Mosambik':'Mozambique','Namibie':'Namibia','Niger':'Niger','Nigérie':'Nigeria','Pobřeží slonoviny':"Ivory Coast",'Rovníková Guinea':'Equatorial Guinea','Rwanda':'Rwanda','Senegal':'Senegal','Seychely':'Seychelles','Sierra Leone':'Sierra Leone','Středoafrická rep.':'Central African Republic','Súdán':'Sudan','Svazijsko':'Eswatini','Tanzanie':'Tanzania','Togo':'Togo','Tunisko':'Tunisia','Uganda':'Uganda','Zambie':'Zambia','Zimbabwe':'Zimbabwe','Afghánistán':'Afghanistan','Arménie':'Armenia','Ázerbájdžán':'Azerbaijan','Bahrajn':'Bahrain','Bangladéš':'Bangladesh','Barma':'Myanmar','Bhútán':'Bhutan','Brunej':'Brunei','Čína':'China','Filipíny':'Philippines','Gruzie':'Georgia','Indie':'India','Indonésie':'Indonesia','Irák':'Iraq','Írán':'Iran','Izrael':'Israel','Japonsko':'Japan','Jemen':'Yemen','Jižní Korea':'South Korea','Jordánsko':'Jordan','Kambodža':'Cambodia','Katar':'Qatar','Kazachstán':'Kazakhstan','Kuvajt':'Kuwait','Kyrgyzstán':'Kyrgyzstan','Laos':'Laos','Libanon':'Lebanon','Malajsie':'Malaysia','Maledivy':'Maldives','Mongolsko':'Mongolia','Nepál':'Nepal','Omán':'Oman','Pákistán':'Pakistan','Palestina':'Palestine','Saúdská Arábie':'Saudi Arabia','Severní Korea':'North Korea','Singapur':'Singapore','Spojené arabské emiráty':'United Arab Emirates','Srí Lanka':'Sri Lanka','Sýrie':'Syria','Tádžikistán':'Tajikistan','Thajsko':'Thailand','Tchaj-wan':'Taiwan','Turkmenistán':'Turkmenistan','Uzbekistán':'Uzbekistan','Vietnam':'Vietnam','Východní Timor':'Timor-Leste','Nová Kaledonie':'New Caledonia','Nový Zéland':'New Zealand','Papua-Nová Guinea':'Papua New Guinea','Argentina':'Argentina','Bolívie':'Bolivia','Brazílie':'Brazil','Ekvádor':'Ecuador','Guyana':'Guyana','Chile':'Chile','Kolumbie':'Colombia','Paraguay':'Paraguay','Peru':'Peru','Surinam':'Suriname','Uruguay':'Uruguay','Venezuela':'Venezuela','Belize':'Belize','Dominikánská republika':'Dominican Republic','Guatemala':'Guatemala','Haiti':'Haiti','Honduras':'Honduras','Mexiko':'Mexico'};
const $=id=>document.getElementById(id);
let terms=[],features=[],cityFeatures=[],orogPolygons=[],orogPoints=[],questions=[],deck=[],current=null,score=0,wrong=0,answered=0,streak=0,best=0,remaining=null,timer=null,active=false,locked=false,attemptsThisQuestion=0;
let zoomBehavior,projection,advanceTimer=null;
function norm(s){return(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'')}
function match(t){let n=norm(aliases[t.name]||t.name);return features.find(f=>[f.properties.ADMIN,f.properties.NAME,f.properties.NAME_EN].some(x=>norm(x)===n))}
function orogTarget(term){return {term,polygons:orogPolygons.filter(f=>norm(f.properties.quiz_term||f.properties.name)===norm(term.name)),points:orogPoints.filter(f=>norm(f.properties.name)===norm(term.name))}}
function map(){
  projection=d3.geoRobinson().fitExtent([[12,12],[1188,638]],{type:'Sphere'});
  const path=d3.geoPath(projection),svg=d3.select('#map');
  const countryLayer=d3.select('#countries'),cityLayer=d3.select('#cities'),polyLayer=d3.select('#orography-polygons'),pointLayer=d3.select('#orography-points');
  countryLayer.selectAll('path').data(features).join('path').attr('class','country').attr('d',path).on('click',function(event,f){if($('filter').value==='Státy a regiony'&&active){event.stopPropagation();pick(f)}});
  polyLayer.selectAll('path').data(orogPolygons).join('path').attr('class','orog-polygon').attr('d',path).on('click',function(event,f){if($('filter').value==='Orografie'&&active){event.stopPropagation();pick(f)}});
  pointLayer.selectAll('circle').data(orogPoints).join('circle').attr('class','orog-dot').attr('cx',d=>projection(d.geometry.coordinates)[0]).attr('cy',d=>projection(d.geometry.coordinates)[1]).attr('r',3.5);
  zoomBehavior=d3.zoom().scaleExtent([1,14]).on('zoom',e=>{countryLayer.attr('transform',e.transform);cityLayer.attr('transform',e.transform);polyLayer.attr('transform',e.transform);pointLayer.attr('transform',e.transform)});
  svg.call(zoomBehavior).on('dblclick.zoom',null);
  svg.on('click.city-orog',function(event){
    const category=$('filter').value;if(!active||!current||locked)return;
    if(category!=='Města'&&category!=='Orografie')return;
    const point=d3.pointer(event,this),transform=d3.zoomTransform(this);let bestFeature=null,bestDistance=Infinity;
    const candidates=category==='Města'?cityFeatures:orogPoints;
    for(const feature of candidates){const xy=projection(feature.geometry.coordinates);if(!xy)continue;const screen=transform.apply(xy),distance=Math.hypot(screen[0]-point[0],screen[1]-point[1]);if(distance<bestDistance){bestDistance=distance;bestFeature=feature}}
    if(bestFeature&&bestDistance<=26)pick(bestFeature);else wrongAttempt();
  });
  $('zoomIn').onclick=()=>svg.transition().duration(180).call(zoomBehavior.scaleBy,1.6);
  $('zoomOut').onclick=()=>svg.transition().duration(180).call(zoomBehavior.scaleBy,1/1.6);
  $('zoomReset').onclick=()=>svg.transition().duration(220).call(zoomBehavior.transform,d3.zoomIdentity);
}
function resetColors(){d3.selectAll('.country,.orog-polygon').classed('wrong',false).classed('revealed',false).classed('correct',false);d3.select('#cities').selectAll('*').remove();d3.select('#orography-points').selectAll('.orog-mark').remove()}
function clearWrongMarks(){d3.selectAll('.country,.orog-polygon').classed('wrong',false).classed('revealed',false)}
function resetZoom(){if(zoomBehavior)d3.select('#map').call(zoomBehavior.transform,d3.zoomIdentity)}
function fmt(s){return s===null?'∞':String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0')}
function stats(){$('score').textContent=score;$('wrong').textContent=wrong;$('questionCount').textContent=`Otázka ${answered+(current?1:0)}`;$('streak').textContent=`Série: ${streak}`;$('progress').style.width=(answered/Math.max(1,questions.length)*100)+'%';$('progressText').textContent=`${answered} / ${questions.length}`}
function end(msg){if(!active)return;active=false;clearInterval(timer);timer=null;clearTimeout(advanceTimer);advanceTimer=null;$('feedback').textContent=msg;$('next').disabled=true;$('finalCorrect').textContent=score;$('finalWrong').textContent=wrong;$('finalAccuracy').textContent=(answered?Math.round(score/Math.max(1,score+wrong)*100):0)+' %';$('finalStreak').textContent=best;$('results').classList.remove('hidden')}
function tick(){if(remaining===null)return;if(remaining<=0){$('timer').textContent='00:00';end('Čas vypršel.');return}remaining--;$('timer').textContent=fmt(remaining)}
function show(){clearTimeout(advanceTimer);advanceTimer=null;clearWrongMarks();attemptsThisQuestion=0;if(!deck.length){end('Všechny dostupné pojmy jsou hotové.');return}current=deck.pop();locked=false;$('term').textContent=current.term.name;$('category').textContent=current.term.category;$('feedback').textContent='Najdi hledané místo na mapě.';$('feedback').className='';$('next').disabled=true;$('next').textContent='Další pojem →';stats()}
function markPoint(feature,kind){
 const xy=projection(feature.geometry.coordinates),circle=d3.select(kind==='city'?'#cities':'#orography-points').append('circle')
  .attr('class',`orog-mark ${kind==='city'?'city-':''}${kind}-correct`)
  .attr('cx',xy[0]).attr('cy',xy[1]).attr('r',kind==='city'?5:7);
 if(kind==='city'){
  const firstTry=attemptsThisQuestion===0;
  circle.style('fill',firstTry?'#22c55e':'#facc15').style('stroke','#ffffff').style('stroke-width','1.4px');
 }
}
function pick(f){
 if(!active||!current||locked)return;const category=$('filter').value;let correct=false;
 if(category==='Státy a regiony')correct=f===current.feature;
 else if(category==='Města')correct=f===current.feature;
 else if(category==='Orografie')correct=current.target.polygons.includes(f)||current.target.points.includes(f);
 if(correct){locked=true;answered++;score++;streak++;best=Math.max(best,streak);$('feedback').textContent='✓ Správně!';$('feedback').className='good';
   if(category==='Státy a regiony')d3.selectAll('.country').filter(d=>d===f).classed('correct',true);
   else if(category==='Města')markPoint(f,'city');
   else if(f.geometry.type==='Point')markPoint(f,'orog');else d3.selectAll('.orog-polygon').filter(d=>d===f).classed('correct',true);
   stats();$('progress').style.width=(answered/questions.length*100)+'%';$('progressText').textContent=`${answered} / ${questions.length}`;$('next').disabled=true;$('next').textContent='Další pojem se načítá…';advanceTimer=setTimeout(()=>{if(active&&locked)show()},650);
 }else{if(category==='Státy a regiony')d3.selectAll('.country').filter(d=>d===f).classed('wrong',true);if(category==='Orografie'&&f.geometry.type!=='Point')d3.selectAll('.orog-polygon').filter(d=>d===f).classed('wrong',true);wrongAttempt()}
}
function wrongAttempt(){if(!active||!current||locked)return;wrong++;attemptsThisQuestion++;streak=0;if(attemptsThisQuestion>=3){locked=true;answered++;$('feedback').textContent='Třetí chybný pokus — správná poloha je označena žlutě.';$('feedback').className='bad';const category=$('filter').value;
 if(category==='Státy a regiony')d3.selectAll('.country').filter(d=>d===current.feature).classed('revealed',true).classed('wrong',false);
 else if(category==='Města'){const xy=projection(current.feature.geometry.coordinates);d3.select('#cities').append('circle').attr('class','city-revealed').attr('cx',xy[0]).attr('cy',xy[1]).attr('r',4).style('fill','#ef4444').style('stroke','#ffffff').style('stroke-width','1px')}
 else {current.target.polygons.forEach(f=>d3.selectAll('.orog-polygon').filter(d=>d===f).classed('revealed',true));current.target.points.forEach(f=>{const xy=projection(f.geometry.coordinates);d3.select('#orography-points').append('circle').attr('class','orog-mark orog-revealed').attr('cx',xy[0]).attr('cy',xy[1]).attr('r',8)})}
 $('next').disabled=false;$('next').textContent='Další pojem →';
 }else{$('feedback').textContent=`✕ Špatně. Ještě ${3-attemptsThisQuestion} ${3-attemptsThisQuestion===1?'pokus':'pokusy'}.`;$('feedback').className='bad'}
 stats();$('progress').style.width=(answered/Math.max(1,questions.length)*100)+'%';$('progressText').textContent=`${answered} / ${questions.length}`}
function start(){clearInterval(timer);clearTimeout(advanceTimer);advanceTimer=null;resetColors();resetZoom();score=wrong=answered=streak=best=0;active=true;$('results').classList.add('hidden');const category=$('filter').value;
 if(category==='Státy a regiony')questions=terms.filter(t=>t.category===category).map(term=>({term,feature:match(term)})).filter(x=>x.feature);
 else if(category==='Města')questions=terms.filter(t=>t.category===category).map(term=>({term,feature:cityFeatures.find(f=>norm(f.properties.name)===norm(term.name))})).filter(x=>x.feature);
 else if(category==='Orografie')questions=terms.filter(t=>t.category===category).map(term=>({term,target:orogTarget(term)})).filter(x=>x.target.polygons.length||x.target.points.length);
 deck=questions.slice().sort(()=>Math.random()-.5);if(!deck.length){active=false;$('feedback').textContent='Pro kategorii nejsou dostupná geografická data.';return}let limit=Number($('duration').value);remaining=limit===0?null:limit;$('timer').textContent=fmt(remaining);if(remaining!==null)timer=setInterval(tick,1000);$('feedback').textContent=`Načteno ${questions.length} lokalizovaných pojmů.`;stats();show()}
async function init(){try{let [t,c,ct,op,oi]=await Promise.all([fetch('./terms.json').then(r=>{if(!r.ok)throw Error('terms.json '+r.status);return r.json()}),fetch('./countries.geojson').then(r=>{if(!r.ok)throw Error('countries.geojson '+r.status);return r.json()}),fetch('./cities.geojson').then(r=>{if(!r.ok)throw Error('cities.geojson '+r.status);return r.json()}),fetch('./orography_polygons.geojson').then(r=>{if(!r.ok)throw Error('orography_polygons.geojson '+r.status);return r.json()}),fetch('./orography_points.geojson').then(r=>{if(!r.ok)throw Error('orography_points.geojson '+r.status);return r.json()})]);
 terms=t;features=c.features;cityFeatures=ct.features;orogPolygons=op.features;orogPoints=oi.features;map();const n=terms.filter(t=>t.category==='Státy a regiony'&&match(t)).length,m=terms.filter(t=>t.category==='Města'&&cityFeatures.some(f=>norm(f.properties.name)===norm(t.name))).length,o=terms.filter(t=>t.category==='Orografie'&&(orogTarget(t).polygons.length||orogTarget(t).points.length)).length;
 $('category').textContent=`${n} států · ${m} měst · ${o} orografických pojmů`;$('feedback').textContent=`Připraveno ${n} států, ${m} měst a ${o} orografických pojmů.`;$('start').onclick=start;$('restart').onclick=start;$('next').onclick=()=>{if(active&&locked)show()};
 }catch(e){console.error(e);$('feedback').textContent='Chyba při načítání dat: '+e.message}}
init();
