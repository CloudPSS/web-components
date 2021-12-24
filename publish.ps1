& { 
  Push-Location $PSScriptRoot

  yarn version
  yarn build
  cd dist
  npm publish

  Pop-Location 
}