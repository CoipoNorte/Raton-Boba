Hola amigo, soy un gran fan de los juegos casuales y adictivos para celular. Hoy quiero que diseñemos y programemos un juego web genial, ultra relajante y gratificante, jugable en cualquier dispositivo: celular en vertical, celular en horizontal, tablet y escritorio.

La idea es un juego acogedor de laboratorio de té de boba y bebidas artesanales (Boba & Tea Lab), donde preparas bebidas por capas de densidad y color y sirves a los clientes en un flujo continuo y relajado, para ver cuántos pedidos perfectos logras entregar antes de que se acabe el tiempo y romper tu propio récord.

Jugabilidad
Un ticket de pedido muestra el vaso de Boba Tea exacto que pide el cliente y tú debes replicarlo arrastrando o tocando ingredientes desde una barra de trabajo hasta el vaso sellable, en cuatro categorías con pestañas:

1. Perlas / Base inferior — boba de tapioca negra, jaleas de popping de mango, perlas de frutilla/fresa, gelatina de coco nata de coco, gelatina de té negro. Máximo 2 capas de toppings de fondo.
2. Té / Infusión — té negro assam, té verde matcha, té oolong de durazno, infusión de flor de guisante de mariposa (azul), té taro morado (se vierten formando degradados).
3. Leche / Foam de queso — leche entera, crema de taro, leche de soya, espumado salado de queso (cream cheese foam), crema de leche condensada.
4. Siropes / Domo & Popote — chorreado de azúcar morena (brown sugar tiger boba), sirope de maracuyá, sirope de taro; topping de galleta triturada o malvaviscos, más elección de tapa de domo y color de pajita/popote.

Reglas y feedback:
* Botón grande SERVIR, más deshacer y limpiar vaso siempre a un toque.
* Si la bebida coincide exactamente con el ticket: puntos + confetti + el vaso sale volando/deslizándose hacia el cliente con sello de plástico perfecto + bonificación de segundos.
* Si falla: se rompe el combo, vibra la barra, pero la bebida se conserva para corregirla.
* Multiplicador de combo creciente (hasta ×2.5) por aciertos encadenados.
* Dificultad progresiva: los pedidos van ganando capas de té tricolor, chorreado tiger boba y toppings dobles conforme avanzas.
* Partidas de ~90 segundos con cronómetro que se extiende al acertar: ciclo corto, adictivo y rejugable.

Estética
Estética japonesa/asiática moderna y acogedora (cozy boba shop / kawaii minimalista): tonos pasteles vibrantes (lavanda, verde matcha, crema, rosado sakura, amarillo mango), tipografía redondeada, fondo con degradados suaves y burbujas flotantes en movimiento.

* Mascota protagonista: un ratoncito boba-barista con un vaso en la mano y visera kawaii, dibujado en SVG, que reacciona en vivo (parpadea, celebra, se preocupa) según cómo te vaya.
* Bebidas 100 % procedurales en SVG: vaso transparente, perlas redondas en el fondo con brillo, líquidos translúcidos con gradientes, chorreado de caramelo por las paredes del vaso y sellado plástico superior dibujados al vuelo — nada de imágenes externas. El ticket y el vaso real deben usar el mismo motor de dibujo, para que la referencia sea siempre fiel.
* Sonido ASMR de Boba Shop sintetizado con WebAudio, sin archivos de audio: sonido de perlas cayendo al fondo, líquido llenándose, selladora térmica (shhh-pop), sorbo de bombilla, arpegio de éxito y fanfarria de récord. Con botón de silencio persistente.
* Animaciones fluidas con spring physics (Framer Motion): el vaso baja con rebote, las perlas se acomodan al fondo, la pajita entra con pop.

Progresión y persistencia
Contador de tés completados y propinas acumuladas. Guarda de forma persistente el récord histórico y la preferencia de sonido con localStorage, encapsulado en un módulo propio (src/game/storage.ts) protegido contra modo incógnito y listo para migrar a IndexedDB sin tocar el resto del juego.

Diseño responsive (muy importante)
El juego debe priorizar siempre el área jugable por encima de los contadores:
* HUD flotante y mínimo: la barra de tiempo pegada al borde superior de la pantalla (unos 5px, de lado a lado, que cambia a rojo en los últimos 10s) y los contadores en pastillas pequeñas translúcidas que flotan sobre la escena sin robar altura. Nada de barras sólidas gruesas.
* Horizontal / tablet / escritorio: tres columnas → ticket del pedido a la izquierda, vaso de boba al centro (protagonista, ocupando toda la altura disponible), barra de ingredientes a la derecha. Centrado con ancho máximo para que no se deforme en monitores ultrapanorámicos.
* Celular en vertical: layout apilado → ticket en barra horizontal compacta arriba, vaso al centro, barra de ingredientes abajo con las fichas en una sola fila.
* Usa un hook de orientación (tipo useIsPortrait) para que girar el dispositivo a mitad de partida reorganice la mesa sin perder la bebida ni el pedido.
* En el ticket, la bebida de referencia debe verse grande y nítida: recorta el encuadre del SVG justo alrededor del vaso (sin elementos decorativos de fondo), sobre una zona de exhibición clara con sombra suave, de modo que llene el marco sea cual sea el número de capas.

Stack técnico
React 19 + TypeScript (estricto) + Vite 7 + Tailwind CSS 4 + Framer Motion + iconos Lucide. Código modular y limpio, separando: tipos y constantes de equilibrio, datos de ingredientes y paletas, lógica (generación de pedidos, validación y puntuación), sonido, persistencia, componentes visuales y pantallas (inicio, partida, fin).

Requerimientos de despliegue
El proyecto se llamará Raton-Boba y debe quedar listo para GitHub y GitHub Pages en:
* Repositorio: https://github.com/CoipoNorte/Raton-Boba
* Web: https://coiponorte.github.io/Raton-Boba/

Archivos de despliegue obligatorios:
1. `vite.config.ts` con `base: '/Raton-Boba/'` (coincidiendo exactamente con el repositorio).
2. `deploy.bat` avanzado de 11 pasos en Windows:
   - REGLA DE ORO: Todas las llamadas a `npm`, `npx`, `git` y `node` dentro de scripts .bat deben usar `call` obligatoriamente para no matar la ejecución del proceso padre.
   - Definir variables `REPO_URL=https://github.com/CoipoNorte/Raton-Boba.git` y `WEB_URL=https://coiponorte.github.io/Raton-Boba/`.
   - Paso [1/11] Comprobar Node.js y npm.
   - Paso [2/11] Verificar Git, `git init` si aplica, y asegurar `origin` a `%REPO_URL%` y rama `main`.
   - Paso [3/11] Auto-crear `.gitignore` completo si no existe.
   - Paso [4/11] Insertar `p.name='raton-boba'`, `predeploy='npm run build'` y `deploy='gh-pages -d dist'` en `package.json` mediante Node.js.
   - Paso [5/11] Insertar/verificar `base: '/Raton-Boba/'` en `vite.config.ts` mediante Node.js.
   - Paso [6/11] `call npm install` e instalación asegurada de `gh-pages` como devDependency (`npm ls gh-pages` + `npm install -D gh-pages`).
   - Paso [7/11] `call npm run build` y validación de `dist\index.html`.
   - Paso [8/11] `call git add -A` y `git commit -m "chore: despliegue Raton Boba"`.
   - Paso [9/11] `call git push -u origin main`.
   - Paso [10/11] `call npm run deploy` o fallback `call npx gh-pages -d dist`.
   - Paso [11/11] Verificación final de la rama remota `origin/gh-pages` e instrucciones claras para activar GitHub Pages en Settings.
3. `.gitignore` completo (`node_modules/`, `dist/`, `.vite/`, etc.).
4. `README.md` profesional y amigable con badges, guía de juego, stack y solución de problemas.
5. `public/.nojekyll` y pantalla de splash ("Cocinando las perlas de tapioca…") en `#root` en `index.html` para evitar la página en blanco en GitHub Pages.
6. `icon.svg` representativo (el ratoncito con vaso de boba) como favicon y `<title>Raton Boba</title>`.

Entrégame el código estructurado, limpio, comentado en español y optimizado, de forma que pueda copiarlo, pegarlo, ejecutar el .bat y tener el juego funcionando en línea de inmediato. ¡Haz que sea una experiencia tan adictiva y reconfortante que todo el mundo quiera jugarla mientras disfruta su té favorito!
