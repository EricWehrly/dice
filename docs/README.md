# Dice Project

## Running the Docker Container

To run the Docker container with the current directory volume mounted, use the following command:

```sh
docker build . -t dice && docker run --rm -p 8080:8080 -it -v $(pwd -W):/app dice bash
```

jfc
$ docker run --rm -p 8080:8080 -it -v $(pwd -W):/app node:22-slim bash

This command does the following:
- `-it`: Runs the container in interactive mode with a terminal.
- `--rm`: Automatically removes the container when it exits.
- `-v ${PWD}:/usr/src/app`: Mounts the current directory to `/usr/src/app` in the container.
- `-p 3000:3000`: Maps port 3000 on your host to port 3000 in the container.
- `node:22`: Uses the Node.js 22 image.

Make sure to run this command from the root of your project directory.

## Removing Local Branches

To remove all branches in the local repository that begin with "copilot-", use the following command:

```sh
git branch | grep "copilot-" | xargs git branch -D
```
