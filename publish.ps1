& { 
  Push-Location $PSScriptRoot

  pnpm install
  yarn version
  pnpm build
  npm publish --access public

  curl.exe -X PUT "https://registry-direct.npmmirror.com/@cloudpss/web-components/sync"
  
  Pop-Location 
}