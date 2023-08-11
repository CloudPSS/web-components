& { 
  Push-Location $PSScriptRoot

  yarn version
  yarn build
  npm publish

  curl.exe -X PUT "https://registry-direct.npmmirror.com/@cloudpss/web-components/sync"
  
  Pop-Location 
}