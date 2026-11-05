# Cambios y validación

## Funcionalidad 1 — Umbral

- Cambios realizados:
  - `src/domain/rules.ts`: `parseThreshold(texto)` valida el dato (acepta coma o punto; número real > 0 y <= 150). Si no es válido devuelve `null`.
  - `src/data/localDb.ts`: `saveMaxTemp(id, maxTemp)` persiste el límite en SQLite con una consulta parametrizada.
  - `src/viewmodel/usePlantViewModel.ts`: `changeMaxTemp(id, texto)` valida, guarda y actualiza el estado de la lista. Si el dato es inválido no guarda y devuelve el mensaje de error.
  - `src/components/ThresholdModal.tsx`: formulario (Modal) asociado al equipo seleccionado, con el límite actual precargado y el error visible. Se usa `Modal` y no `Alert.prompt` porque este último solo existe en iOS.
  - `src/views/PlantScreen.tsx`: el botón **Umbral** abre el formulario del equipo de esa tarjeta.
  - Al actualizarse `items`, se recalcula la alarma de la tarjeta, el contador de alarmas y el panel HTML (la WebView se regenera porque depende de `items`).
- Verificación:
  - Valores inválidos (`0`, `-5`, `151`, `abc`, vacío): no se guardan y se muestra el error en el formulario.
  - Valor válido (por ejemplo bajar el límite de P-101 por debajo de su temperatura): la tarjeta pasa a **ALARMA**, sube el contador y la barra del panel HTML se marca en naranja.
  - Apagando el equipo con el switch, la alarma desaparece (solo hay alarma si está activado).
  - Se cerró y volvió a abrir la app: el límite nuevo se mantiene (queda guardado en SQLite).

## Funcionalidad 2 — Historial

- Cambios realizados:
  - `src/data/localDb.ts`: `getLastReadings(id)` lee los últimos 10 registros del equipo (`WHERE equipment_id = ? ORDER BY id DESC LIMIT 10`), del más nuevo al más antiguo.
  - `src/viewmodel/usePlantViewModel.ts`: `loadHistory(id)` carga el historial en el estado (`history`, `historyLoading`) y maneja el error.
  - `src/components/HistoryModal.tsx`: muestra fecha/hora, temperatura y origen de cada lectura, con estado vacío ("Todavía no hay lecturas registradas…").
  - `src/views/PlantScreen.tsx`: el botón **Historial** abre el historial del equipo de esa tarjeta.
  - Las lecturas ya se guardaban en la tabla `readings` desde `recordReading`, que usan tanto **Simular ciclo** (origen "simulación") como **Sincronizar API** (origen "API ambiental").
- Verificación:
  - Con la base recién creada, el historial muestra el estado vacío.
  - Después de varias simulaciones y sincronizaciones aparecen las lecturas ordenadas de la más nueva a la más vieja, con máximo 10 registros.
  - A-003 muestra las lecturas de origen "API ambiental"; P-101 y M-204 las de "simulación".
  - Se reinició la app y el historial se conserva.

## Refactorización A — SQL injection en la búsqueda

- Problema: en `src/data/localDb.ts`, `findEquipment` armaba el SQL concatenando el texto del buscador (`LIKE '%${filter}%'`). Un texto como `' OR 1=1 --` modifica la consulta (inyección SQL) y una comilla simple sola rompía la búsqueda.
- Solución: se pasó a consulta parametrizada (`WHERE name LIKE ? OR id LIKE ?` con el patrón `%texto%` como parámetro). El motor trata el valor como dato y no como parte del SQL. Sin filtro se usa una consulta fija.
- Evidencia: la búsqueda por código y por nombre devuelve los mismos resultados que antes (ej. "P-1", "motor"); con el campo vacío se listan los tres equipos; buscar `'` o `' OR 1=1 --` ya no rompe ni altera la consulta (muestra "No se encontraron equipos").

## Refactorización B — Regla de alarma duplicada e inconsistente

- Problema: la condición de alarma estaba copiada en tres lugares (`EquipmentCard` y el contador en `src/views/PlantScreen.tsx`, y el panel en `src/components/OverviewWeb.tsx`). La copia del panel HTML no tenía en cuenta si el equipo estaba activado: marcaba en naranja equipos **detenidos**, contradiciendo la regla (alarma solo si está activado y `temperatura >= límite`).
- Solución: se centralizó la regla en una única función pura `isInAlarm()` en `src/domain/rules.ts` y se usa en los tres lugares. A la WebView se le pasa el campo `alarm` ya calculado, en vez de repetir la lógica dentro del HTML. Además, al ser una función pura sin dependencias de UI ni de SQLite, se puede probar de forma aislada.
- Evidencia: con equipos activados el comportamiento es el mismo que antes. Apagando un equipo que supera su límite, ahora la tarjeta, el contador y el panel HTML coinciden (ninguno marca alarma). `npm run typecheck` sin errores.

## Nota sobre `npm run typecheck`

- El proyecto original ya tenía un error de tipos que no viene de estos cambios: en `PlantScreen.tsx`, `<StatusBar backgroundColor={...} />` usa una prop que React Native 0.88 ya no admite (la app es edge-to-edge y el fondo lo pone la vista). Se quitó esa prop sin cambio visible, y `npm run typecheck` queda sin errores.

## Otros problemas observados (no modificados)

- **Sincronizar API** también ejecuta una simulación antes de consultar la API (`usePlantViewModel.ts`), mezclando dos responsabilidades; y si falla la API, el `catch` descarta el error real.
- `recordReading` hace dos escrituras (UPDATE + INSERT) sin transacción: si falla la segunda, quedan inconsistentes.
- La búsqueda consulta la base en cada tecla y las respuestas pueden llegar desordenadas.

## Uso de IA (opcional)

- Herramienta utilizada:
- Qué acepté, revisé o corregí:
