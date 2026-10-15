@echo off
chcp 65001 >nul
setlocal DisableDelayedExpansion
title Raton Boba - Despliegue a GitHub Pages
cd /d "%~dp0"

set "REPO_URL=https://github.com/CoipoNorte/Raton-Boba.git"
set "WEB_URL=https://coiponorte.github.io/Raton-Boba/"
set "COMMIT_MSG=chore: despliegue Raton Boba"
set "BRANCH=main"

echo ============================================================
echo   Raton Boba - Despliegue a GitHub Pages (11 pasos)
echo ============================================================
echo.

rem ---------------------------------------------------------------
echo [1/11] Herramientas: Node.js y npm
rem ---------------------------------------------------------------
call node -v
if errorlevel 1 goto err_node
call npm -v
if errorlevel 1 goto err_npm
echo.

rem ---------------------------------------------------------------
echo [2/11] Git: repositorio, origin y rama main
rem ---------------------------------------------------------------
call git --version
if errorlevel 1 goto err_git
if exist ".git" goto git_exists
call git init
if errorlevel 1 goto err_git
:git_exists
call git remote get-url origin >nul 2>nul
if errorlevel 1 goto add_origin
call git remote set-url origin "%REPO_URL%"
if errorlevel 1 goto err_git
goto origin_ok
:add_origin
call git remote add origin "%REPO_URL%"
if errorlevel 1 goto err_git
:origin_ok
rem Cambia a main sin reiniciar ni borrar cambios locales.
call git rev-parse --verify --quiet refs/heads/main >nul 2>nul
if errorlevel 1 goto create_main
goto switch_main
:create_main
call git switch -c main
if errorlevel 1 call git checkout -b main
if errorlevel 1 goto err_git
goto branch_ok
:switch_main
for /f "delims=" %%b in ('call git rev-parse --abbrev-ref HEAD 2^>nul') do set "CUR_BRANCH=%%b"
if "%CUR_BRANCH%"=="main" goto branch_ok
call git switch main
if errorlevel 1 goto err_git
:branch_ok
echo Rama actual: main
echo.

rem ---------------------------------------------------------------
echo [3/11] .gitignore
rem ---------------------------------------------------------------
if exist ".gitignore" goto gitignore_ok
> ".gitignore" echo node_modules/
>> ".gitignore" echo dist/
>> ".gitignore" echo .vite/
>> ".gitignore" echo *.log
>> ".gitignore" echo npm-debug.log*
>> ".gitignore" echo .env
>> ".gitignore" echo .cache/
>> ".gitignore" echo deploy-tmp/
>> ".gitignore" echo *.tmp
echo .gitignore creado.
goto gitignore_done
:gitignore_ok
echo .gitignore ya existe.
:gitignore_done
echo.

rem ---------------------------------------------------------------
echo [4/11] package.json (helper Node)
rem ---------------------------------------------------------------
call node "scripts\deploy-prepare.cjs" package
if errorlevel 1 goto err_package
echo.

rem ---------------------------------------------------------------
echo [5/11] Vite base y GitHub Pages (helper Node)
rem ---------------------------------------------------------------
call node "scripts\deploy-prepare.cjs" vite
if errorlevel 1 goto err_vite
echo.

rem ---------------------------------------------------------------
echo [6/11] Dependencias (npm install y gh-pages)
rem ---------------------------------------------------------------
call npm install
if errorlevel 1 goto err_npm_install
call npm ls gh-pages --depth=0 >nul 2>nul
if not errorlevel 1 goto gh_pages_ok
echo gh-pages no esta instalado. Instalando...
call npm install --save-dev gh-pages
if errorlevel 1 goto err_npm_install
:gh_pages_ok
echo gh-pages disponible.
echo.

rem ---------------------------------------------------------------
echo [7/11] Build de produccion
rem ---------------------------------------------------------------
call npm run build
if errorlevel 1 goto err_build
if not exist "dist\index.html" goto err_build_files
if not exist "dist\.nojekyll" goto err_build_files
echo dist\index.html y dist\.nojekyll verificados.
echo.

rem ---------------------------------------------------------------
echo [8/11] Commit
rem ---------------------------------------------------------------
call git add -A
if errorlevel 1 goto err_git
call git diff --cached --quiet
if not errorlevel 1 goto no_changes
call git commit -m "%COMMIT_MSG%"
if errorlevel 1 goto err_commit
echo Commit creado: %COMMIT_MSG%
goto commit_done
:no_changes
echo No hay cambios nuevos que confirmar.
:commit_done
echo.

rem ---------------------------------------------------------------
echo [9/11] Push a origin/%BRANCH%
rem ---------------------------------------------------------------
call git push -u origin %BRANCH%
if errorlevel 1 goto err_push
echo.

rem ---------------------------------------------------------------
echo [10/11] Publicar en GitHub Pages (rama gh-pages)
rem ---------------------------------------------------------------
call npm run deploy
if not errorlevel 1 goto deploy_ok
echo npm run deploy fallo. Probando con npx gh-pages...
call npx gh-pages -d dist
if errorlevel 1 goto err_deploy
:deploy_ok
echo Publicacion enviada.
echo.

rem ---------------------------------------------------------------
echo [11/11] Verificacion de origin/gh-pages
rem ---------------------------------------------------------------
call git ls-remote --exit-code --heads origin gh-pages
if errorlevel 1 goto warn_pages
echo La rama gh-pages existe en GitHub.
goto done

:warn_pages
echo AVISO: todavia no veo la rama gh-pages en GitHub.
echo Espera un minuto y vuelve a ejecutar este paso, o revisa la configuracion.
goto done

:done
echo.
echo ============================================================
echo   Listo. Tu juego:
echo   %WEB_URL%
echo ============================================================
echo.
echo CONFIGURACION INICIAL (solo la primera vez):
echo   1. Abre el repositorio en GitHub.
echo   2. Entra en Settings ^> Pages.
echo   3. En "Build and deployment" elige "Deploy from a branch".
echo   4. Branch: gh-pages   Folder: / (root)   y pulsa Save.
echo   5. Espera 1-2 minutos y abre la URL de arriba.
echo.
pause
exit /b 0

rem ---------------------------------------------------------------
rem Errores
rem ---------------------------------------------------------------
:err_node
echo ERROR: Node.js no esta instalado o no esta en PATH. Descargalo desde https://nodejs.org
goto fail
:err_npm
echo ERROR: npm no esta disponible. Reinstala Node.js (incluye npm).
goto fail
:err_git
echo ERROR: Git no esta instalado o fallo un comando de git. Descargalo desde https://git-scm.com
goto fail
:err_package
echo ERROR: el helper no pudo preparar package.json. Revisa el mensaje anterior.
goto fail
:err_vite
echo ERROR: el helper no pudo configurar Vite/Pages. Revisa el mensaje anterior.
goto fail
:err_npm_install
echo ERROR: npm install fallo. Revisa tu conexion a internet y vuelve a intentarlo.
goto fail
:err_build
echo ERROR: npm run build fallo. Corrige los errores de compilacion mostrados arriba.
goto fail
:err_build_files
echo ERROR: el build no genero dist\index.html o dist\.nojekyll.
goto fail
:err_commit
echo ERROR: no se pudo crear el commit.
echo Si Git dice que falta identidad, configúrala una sola vez con:
echo   git config --global user.name "Tu Nombre"
echo   git config --global user.email "tu@correo.com"
goto fail
:err_push
echo ERROR: git push fallo.
echo Si pide autenticacion, inicia sesion en GitHub (navegador o token de acceso personal)
echo y vuelve a ejecutar este archivo.
goto fail
:err_deploy
echo ERROR: no se pudo publicar en gh-pages. Revisa permisos del repositorio y la conexion.
goto fail

:fail
echo.
echo Despliegue interrumpido.
pause
exit /b 1
