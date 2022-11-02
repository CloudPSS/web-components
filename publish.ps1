& { 
  Push-Location $PSScriptRoot

  yarn version
  yarn build
  npm publish

  Pop-Location 
}