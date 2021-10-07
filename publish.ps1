& { 
  Push-Location $PSScriptRoot

  yarn version
  yarn build
  cd publish
  npm publish

  Pop-Location 
}