/* Definición del analizador de reglas */
%{
    function addBomb(contenido, linea, columna) {
        return {
            contenido: contenido,
            linea: linea,
            columna: columna
        };    
    }
%}

/* Analizador Léxico */
%lex

%%
\s+                        /* Ignorar espacios en blanco */
\r|\n|\r\n                 /* Ignorar saltos de línea */
"conf_ini"                 return 'INICIO_CONFIG';
"conf:fin"                 return 'FIN_CONFIG';
"//"[^\n]*                 return 'COMENTARIO';
"ADD"                      return 'ADD_BOMB';
"x"                        return 'X_CORD';
"y"                        return 'Y_CORD';
":"                        return 'DOS_PUNTOS';
","                        return 'COMA';
[0-9]+("."[0-9]+)?         return 'NUM';
<<EOF>>                    return 'EOF';
.                          { console.error('Caracter no reconocido: ' + yytext); }

/lex

/* Análisis Sintáctico */
%start inicio

%%

inicio
    : INICIO_CONFIG lista_config FIN_CONFIG EOF
        {
            return {
                tipo: 'juego',
                config: $2
            };
        }
    ;

lista_config
    : configuraciones
        {
            $$ = $1;
        }
    |
        {
            $$ = [];
        }
    ;

configuraciones
    : configuraciones configuracion
        {
            $$ = $1;
            $$.push($2);
        }
    | configuracion
        {
            $$ = [$1];
        }
    | configuraciones COMENTARIO
        {
            $$ = $1;
        }
    | COMENTARIO 
        {
            $$ = [];
        }
    ;

configuracion
    : ADD_BOMB X_CORD DOS_PUNTOS NUM COMA Y_CORD DOS_PUNTOS NUM
        {
            $$ = addBomb({
                x: Number($4),
                y: Number($8)
            }, @1.first_line, @1.first_column);
        }
    | ADD_BOMB Y_CORD DOS_PUNTOS NUM COMA X_CORD DOS_PUNTOS NUM
        {
            $$ = addBomb({
                x: Number($8),
                y: Number($4)
            }, @1.first_line, @1.first_column);        
        }
    ;