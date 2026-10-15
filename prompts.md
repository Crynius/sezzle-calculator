# AI Usage Log

This is a selection of the prompts I used while building this project, written in Spanish as I work with AI, with a one-line English summary under each. Prompts marked **(reconstructed)** are rewritten from memory because I did not keep the exact text, so their wording is approximate. The rest are as I wrote them. I left out routine messages (screenshots of errors, `.gitignore` and folder-cleanup questions).

**Tools used:** [TOOL NAME] for planning, scaffolding, backend, frontend and tests; Claude for the final README review.

---

## 1. Planning

**(reconstructed)**

I gave the AI the assessment email and asked it to analyze the requirements and recommend the tools and technologies to use.

> *"te voy a pasar el correo de la prueba tecnica de Sezzle, analizalo y dime que herramientas y tecnologias deberia usar para hacerla"*



---

## 2. Scaffolding

I asked to build the project in stages and asked whether to start with the backend or the frontend.

> *"me gustaria que vayamos por partes ya cree el proyecto en vs code con el comando para crear proyectos de react, con que me recomiendas empezar? con el backend? o con el frontend?"*



---

## 3. UI / UX decisions

Asked to center the calculator and turn the history into a button that opens a panel.

> *"ok mucho mucho mejor, pero que tal si lo mejoramos? que tal si lo llevamos al centro y hagamos el historial sea un boton que despliegue la ventana de historial"*

Found a layout bug: with many operations, the history pushed the calculator down. I asked to keep it on the right, open it only on click, and cap it at 8 entries.

> *"ya encontre varios bugs por ejemplo mira esto cuando las operaciones incrementa, creo que queda muy feo tener el historial en la parte de abajo mantenlo a la derecha y que solo se abra si damos click en el boton historial, tambien haz que se mantenga un historial de maximo 8 operaciones" "arma el prompt adecuado para resolver mi peticion"*



---

## 4. Core engine: from a two-operand accumulator to a full expression parser

Asked that operations not be applied until `=` is pressed, like real scientific calculators, and suggested adding parentheses.

> *"creo que una manera de mejorar el codigo de la calculadora seria mostrar cuando tenemos seleccionada la raiz, que no se apliquen las operaciones hasta no darle al igual pq si voy a sumar y multiplicar varios numeros deberia poderse como en las calculadoras cientificas de la vida real y seria bueno agvregarle parentesis"*

Identified the limitation myself: the calculator only handled two operands at a time. I asked for full expressions like `3x3-6/8`, evaluated only on `=`, plus parentheses. This is what led to the recursive descent parser in the backend.

> *"no no olvidate de esto un momento, hablemos de un nuevo problema, la calculadora no permite hacer varias operaciones es decir si quiero hacer 3x3-6/8 si lo hace pero no deja meter toda la operacion a la calculadora sino que solo deja meter de a dos operaciones es decir el 3x3 y luego si hace el resultado - 6 y asi sucesivamente, la idea seria que deje meter las operaciones primero y no operar hasta no darle al igual y creo que tambien seria bueno que la calculadora tenga parentesis para las operaciones"*

Found a bug: `5x6%` was not evaluated. The fix made `%` a postfix operator that divides by 100.

> *"quedo super bien, solo antes de continuar, encontre un bug que al meter 5x6% no hace la operacion"*



---

## 5. Bug hunting

**(reconstructed)**

I asked the AI to try to break my own code and look for arithmetic errors and edge cases.

> *"ahora quiero que intentes romper mi calculadora: busca formas de bugearla y dime si ves posibles errores aritmeticos o casos limite que no esten cubiertos"*

