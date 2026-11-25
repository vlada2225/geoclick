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
