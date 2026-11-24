# VozTask — Asistente personal por voz

Proyecto de HTML5, CSS3 y JavaScript para el taller de Interfaces Naturales de Usuario (DAM).

## Cómo ejecutar
1. Abre `index.html` en el navegador para usar el modo demostración.
2. Para reconocimiento de voz real, utiliza un navegador compatible, concede permiso al micrófono y, preferiblemente, abre la web desde HTTPS (GitHub Pages) o localhost.
3. Pulsa el micrófono y di uno de estos comandos: «Añadir tarea estudiar Java», «Mostrar tareas», «Eliminar tareas» o «Modo oscuro».
4. Si el micrófono no funciona, pulsa los botones de demostración. **Estos botones simulan los comandos, no reconocen voz.**

## Funcionamiento
La Web Speech API (`SpeechRecognition` o `webkitSpeechRecognition`) transforma la voz en texto. JavaScript normaliza la frase y la compara con los comandos admitidos. Después añade tareas, muestra la lista, abre un diálogo de confirmación para borrarlas o alterna el tema. La interfaz se actualiza modificando el DOM. `speechSynthesis` pronuncia las respuestas cuando está disponible. Las tareas y el tema se guardan en `localStorage`.

## Publicar en GitHub Pages
Sube `index.html` y las carpetas `css` y `js` a la raíz de un repositorio. En **Settings → Pages**, selecciona **Deploy from a branch**, rama **main**, carpeta **/(root)** y guarda. Abre la URL HTTPS que te proporcione GitHub.

## Pruebas para documentar en la entrega
- [ ] Añadir tarea (voz real)
- [ ] Mostrar tareas (voz real)
- [ ] Eliminar tareas con confirmación (voz real)
- [ ] Modo oscuro (voz real)
- [ ] Añadir tarea (simulación)
- [ ] Mostrar tareas (simulación)
- [ ] Eliminar tareas con confirmación (simulación)
- [ ] Modo oscuro (simulación)
- [ ] Comando desconocido
- [ ] Diseño móvil

Marca solo las pruebas que hayas realizado realmente. La compatibilidad de voz depende del navegador, permisos y dispositivo.
