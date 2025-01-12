### Copilot CLI setup

https://docs.github.com/en/copilot/using-github-copilot/using-github-copilot-in-the-command-line

install winget

`winget install GitHub.cli`

echo this to bashrc:
`export PATH="$PATH:/c/Program Files/GitHub CLI"`

(had to get path from install logs for some dumb reason)

`gh auth login`

`gh extension install github/gh-copilot`