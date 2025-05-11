# Projet Voltaire Tampermonkey Script

This project is a Tampermonkey script designed to automate the [Projet-voltaire](https://projet-voltaire.Fr). 
It's only working on `orthographe` and can get the correction on Reverso and Scribens

## Prerequisites

- [Tampermonkey](https://www.tampermonkey.net/) installed in your browser.
- Node.js installed on your system.
- `Scribens.js` running as a background service.

## Installation

1. Clone this repository to your local machine:
    ```bash
    https://github.com/naolatam/Voltaire-bot
    cd projet-voltaire
    ```

2. Set up and run `Scribens.js`:
    - Ensure `Scribens.js` is properly configured and running with Node.js.
    - Start the service:
      ```bash
      npm i express
      node Scribens.js
      ```

3. Install the Tampermonkey script:
    - Open Tampermonkey in your browser.
    - Create a new script and paste the contents of the provided script file.
    - Save the script.

## Usage

- Ensure `Scribens.js` is running in the background.
- Navigate to the projet voltaire and go in the `Orthographe` section.
- The script will automatically interact with `Scribens.js` to provide grammar and spell-checking features from scribens.
- The script will automatically choose the first not ended activity and will work on it until it successfully end it.

## Configuration
You can configure the script in the file. Look at the first line, all configuration possible are explained


## Contributing

Feel free to submit issues or pull requests to improve the project.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.  

## Disclaimers
This script is intended for educational purposes only.  
It is not affiliated with or endorsed by Projet Voltaire, Reverso, or Scribens.  
Use this script responsibly.  
The author of this script will not be held responsible for any misuse or consequences arising from its use.
