set MONGOOSE=%~dp0bin\mongoose.exe
set SERVER_ROOT=%~dp0..\deploy\build
set SERVER_ADDR=http://localhost:5678

%MONGOOSE% -d %SERVER_ROOT% -l %SERVER_ADDR%
