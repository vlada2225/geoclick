GeoClick 3.5
===========

Spuštění
--------
Rozbal ZIP a ve složce geoclick spusť:
  python -m http.server 8000
Potom otevři http://localhost:8000

Novinky ve verzi 3.5
-------------------
- Přidána hratelná kategorie Orografie.
- Pohoří a vysočiny se vybírají kliknutím do mapového polygonu.
- Vrcholy a další bodově určené útvary se vybírají kliknutím do 26 px od bodu.
- Sierra Nevada má tři uznávané alternativní oblasti (Španělsko, USA, Argentina); každá je správnou odpovědí na stejný pojem.
- Zachovány funkce GeoClick 3.4: Robinsonovo zobrazení, zoom, města, státy a tři pokusy.

Data orografie
--------------
Polygony vycházejí z GMBA Mountain Inventory v2.0 Standard Basic; vrcholové body jsou samostatná bodová data. Obě vrstvy jsou v EPSG:4326. Podrobnosti a upozornění k aproximacím jsou v původním README v balíčku GeoClick_orography_data_v2.

Poznámka k datům
----------------
Dárfúr je v datech zastoupen pohořím Marrah jako aproximací; Súdánská vysočina je částečná aproximace. Jižní Alpy jsou interpretovány jako Southern Alps na Novém Zélandu. Některé názvy v herním seznamu jsou zachovány přesně podle původního seznamu.


GeoClick 3.12
=============

Opravy a doplnění geografických dat
-----------------------------------
- Vrstva států byla aktualizována z Natural Earth 10m Admin 0 Countries.
- Do vrstvy byly doplněny vybrané regiony z Natural Earth 10m Admin 1 States and Provinces.
- Doplněny regiony: Ceuta, Čečensko, Kašmír, Kurdistán, Tibet, Ujgursko,
  Nový Jižní Wales, Tasmánie, Victoria, Francouzská Guyana, Aljaška,
  Britská Kolumbie, Florida, Manitoba a Massachusetts.
- Doplněny chybějící státy a území: Komory, Mauricius, Seychely, Bahrajn,
  Maledivy a Singapur.
- Doplněno samostatné polygonové pokrytí Hongkongu, Macaa a Palestiny.
- Las Vegas má opravené souřadnice pro Las Vegas v Nevadě.
- Opraven alias pro Pobřeží slonoviny.
- Opravena jedna neplatná geometrie Egypta pomocí make_valid.

Poznámky k interpretaci regionů
-------------------------------
- Kašmír je složená aproximace z polygonů Jammu and Kashmir, Ladakh,
  Azad Kashmir a Gilgit-Baltistan.
- Kurdistán je složená aproximace z Duhoku, Erbilu, Sulaymaniyahu
  a íránské provincie Kurdistan. Nejde o jednotnou mezinárodně uznanou
  administrativní jednotku.
- Ostatní doplněné regiony odpovídají vybraným administrativním jednotkám
  Natural Earth Admin 1.
- Tři alternativní oblasti Sierra Nevada (Španělsko, USA, Argentina)
  zůstávají beze změny podle zadání.

Kontrola
--------
- 132/132 pojmů v kategorii Státy a regiony má odpovídající polygon.
- 150/150 měst má odpovídající bod.
- 36/36 orografických pojmů má odpovídající geometrii.
- Kontrola geometrie vrstvy států a regionů: bez neplatných geometrií.
- Data jsou ve WGS 84 (EPSG:4326).
