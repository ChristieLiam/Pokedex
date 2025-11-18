// Constants for API URLs
const POKEAPI_BY_NAME_ID = 'https://pokeapi.co/api/v2/pokemon/'; // Base URL for fetching Pokémon by name or ID
const POKEAPI_BY_TYPE = 'https://pokeapi.co/api/v2/type/'; // Base URL for fetching Pokémon by type
let FAVORITEPOKEMON = []; // Array to store favorite Pokémon names

// Utility Functions

/**
 * Clears the Pokémon display area by emptying the grid and large card containers.
 */
function clearCards() {
    document.getElementById("grid-container").innerHTML = '';
    document.getElementById("LargeCardHolder").innerHTML = '';
}

// Main Search Function

/**
 * Handles different types of Pokémon searches (individual, by type, or favorites).
 * @param {string} searchType - Type of search ("individual", "typeSearch", "typeSearchPart2").
 * @param {string|array} searchTerm - The search term (name, ID, type, or array of names).
 */
async function masterSearch(searchType, searchTerm) {
    clearCards();

    if (searchType === "individual") {
        let pokemonData = await findPokemonIndividual(searchTerm);
        console.log(pokemonData);
        await displayPokemonDataLARGECARD(pokemonData);
    }

    if (searchType === "typeSearch") {
        let pokemonNamesArray = await findPokemonByType(searchTerm);
        await masterSearch("typeSearchPart2", pokemonNamesArray);
    }

    if (searchType === "typeSearchPart2") {
        for (let pokemon of searchTerm) {
            let pokemonData = await findPokemonIndividual(pokemon);
            await displayPokemonDataMINICARD(pokemonData);
        }
    }
}

// Data Fetching Functions

/**
 * Fetches Pokémon data by name or ID.
 * @param {string} pokemonName - Name or ID of the Pokémon.
 * @returns {object} - Pokémon data object.
 */
async function findPokemonIndividual(pokemonName) {
    if (!pokemonName) {
        alert("No Name or ID Specified.");
        return;
    }
    try {
        const response = await fetch(POKEAPI_BY_NAME_ID + pokemonName.toLowerCase());
        return await response.json();
    } catch (error) {
        alert("Couldnt Find Any Pokemon With The Name/ID: "+pokemonName)
        console.error('Error fetching Pokémon data:', error);
        return null;
    }
}

/**
 * Fetches Pokémon names by type or returns favorites.
 * @param {string} type - Type of Pokémon or "favorites" or "all".
 * @returns {array} - Array of Pokémon names.
 */
async function findPokemonByType(type) {
    if (!type) {
        alert("No Type Specified.");
        return;
    }

    if (type === "favorites") {
        if (FAVORITEPOKEMON[0] === "" || FAVORITEPOKEMON[0] == null) {
            alert('No Favorite Pokémon');
        } else {
            return FAVORITEPOKEMON;
        }
    } else {
        try {
            const response = await fetch(POKEAPI_BY_TYPE + type.toLowerCase());
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            return data.pokemon.map(base => base.pokemon.name);
        } catch (error) {
            console.error('Error fetching Pokémon by type:', error);
            return [];
        }
    }
}

/**
 * Fetches and returns Pokémon type icons.
 * @param {array} types - Array of Pokémon types.
 * @returns {array} - Array of type icon URLs.
 */
async function getPokemonTypeImg(types) {
    const typeImgUrls = [];
    for (const type of types) {
        try {
            const response = await fetch(`${POKEAPI_BY_TYPE}${type.toLowerCase()}`);
            const typeData = await response.json();
            const typeIconUrl = typeData.sprites?.['generation-viii']?.['legends-arceus'].name_icon;
            typeImgUrls.push(typeIconUrl || "");
        } catch (err) {
            console.error(`Error fetching type icon for "${type}":`, err);
        }
    }
    return typeImgUrls;
}

/**
 * Fetches Pokémon's evolution chain ID.
 * @param {number} pokemonID - ID of the Pokémon.
 * @returns {string} - Evolution chain URL or 'NoEvos'.
 */
async function getPokemonEvolutionChainID(pokemonID) {
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemonID}`);
        const data = await response.json();
        return data?.evolution_chain?.url || 'NoEvos';
    } catch (error) {
        console.error("Error fetching evolution chain ID:", error);
        return 'NoEvos';
    }
}

/**
 * Fetches the full evolution chain from the URL.
 * @param {string} url - Evolution chain URL.
 * @returns {object} - Evolution chain data.
 */
async function getPokemonEvolutionsTree(url) {
    try {
        const response = await fetch(url);
        return await response.json();
    } catch (error) {
        console.error("Error fetching evolution chain data:", error);
        return null;
    }
}

/**
 * Fetches evolution sprites.
 * @param {array} evolutions - Array of Pokémon names in the evolution chain.
 * @returns {array} - Array of sprite URLs.
 */
async function getEvolutionSprites(evolutions) {
    let evoSpriteUrls = [];
    for (const name of evolutions) {
        let data = await findPokemonIndividual(name);
        evoSpriteUrls.push(data.sprites.front_default || "assets/imageNotAvailable.png");
    }
    return evoSpriteUrls;
}

// Data Extraction Functions

/**
 * Extracts Pokémon types from data.
 * @param {object} data - Pokémon data object.
 * @returns {array} - Array of Pokémon types.
 */
function getTypes(data) {
    return data.types.map(typeObj => typeObj.type.name);
}

/**
 * Extracts Pokémon moves from data.
 * @param {object} data - Pokémon data object.
 * @returns {array} - Array of Pokémon moves.
 */
function getMoves(data) {
    return data.moves.map(moveObj => ({
        moveName: moveObj.move.name,
        moveLearnMethod: moveObj?.["version_group_details"]?.[0]?.["move_learn_method"]?.name
    }));
}

/**
 * Extracts Pokémon abilities from data.
 * @param {object} data - Pokémon data object.
 * @returns {array} - Array of Pokémon abilities.
 */
function getAbilities(data) {
    return data.abilities.map(abilityObj => ({
        abilityName: abilityObj.ability.name,
        isHidden: abilityObj.is_hidden,
    }));
}

/**
 * Extracts Pokémon stats from data.
 * @param {object} data - Pokémon data object.
 * @returns {array} - Array of Pokémon stats.
 */
function getStats(data) {
    return data.stats.map(statObj => ({
        statName: statObj.stat.name,
        statValue: statObj.base_stat
    }));
}

/**
 * Extracts Pokémon sprites from data.
 * @param {object} data - Pokémon data object.
 * @returns {array} - Array of sprite URLs.
 */
function getSprites(data) {
    return [
        data.sprites.front_default || "assets/imageNotAvailable.png",
        data.sprites.back_default || "assets/imageNotAvailable.png",
        data.sprites.front_shiny || "assets/imageNotAvailable.png",
        data.sprites.back_shiny || "assets/imageNotAvailable.png"
    ];
}

// Display Functions

/**
 * Displays an error message.
 * @param {string} message - Error message to display.
 */
function displayErrorMessage(message) {
    const pokemonDataDiv = document.getElementById("pokemonData");
    pokemonDataDiv.innerHTML = `<p style="color: red;">${message}</p>`;
}

/**
 * Displays Pokémon types with icons.
 * @param {array} types - Array of Pokémon types.
 * @param {array} typeImgUrls - Array of type icon URLs.
 * @param {string} dest - Destination element ID.
 */
function displayTypes(types, typeImgUrls, dest) {
    const location = document.getElementById(dest);
    types.forEach((type, index) => {
        location.innerHTML += `<img src="${typeImgUrls[index]}" alt="${type} Icon" />`;
    });
}

/**
 * Displays Pokémon abilities.
 * @param {array} abilities - Array of Pokémon abilities.
 * @param {string} dest - Destination element ID.
 */
function displayAbilities(abilities, dest) {
    const location = document.getElementById(dest);
    location.innerHTML += `<h3>Abilities:</h3>`;
    abilities.forEach(ability => {
        location.innerHTML += `<h4>${formatText(ability.abilityName)}</h4><p>Is Hidden: ${formatText(ability.isHidden.toString())}</p>`;
    });
}

/**
 * Displays Pokémon moves.
 * @param {array} moves - Array of Pokémon moves.
 * @param {string} dest - Destination element ID.
 */
function displayMoves(moves, dest) {
    const location = document.getElementById(dest);
    location.innerHTML += `<h3>Moves: (Can Be Learned)</h3><div id="scrollable-text" class="scrollable-text"></div>`;
    const scrollingMovesList = document.getElementById("scrollable-text");

    // Group moves by their learn method
    const movesByMethod = {};
    moves.forEach(move => {
        const method = move.moveLearnMethod.toString();
        if (!movesByMethod[method]) {
            movesByMethod[method] = [];
        }
        movesByMethod[method].push(move);
    });

    // Display moves under their respective learn method headings
    if (Object.keys(movesByMethod).length > 0) {
        for (const method in movesByMethod) {
            scrollingMovesList.innerHTML += `<h3>Learned By ${formatText(method)}</h3>`;
            movesByMethod[method].forEach(move => {
                scrollingMovesList.innerHTML += `<p>${formatText(move.moveName)}</p>`;
            });
        }
        location.innerHTML += `<p class="note">This is a scrollable box.</p>`;
    } else {
        scrollingMovesList.innerHTML += `<p>No Moves Available For This Pokémon</p>`;
    }
}

/**
 * Displays Pokémon stats.
 * @param {array} stats - Array of Pokémon stats.
 * @param {string} dest - Destination element ID.
 */
function displayStats(stats, dest) {
    const location = document.getElementById(dest);
    location.innerHTML += `<h4>Statistics:</h4>`;
    stats.forEach(stat => {
        location.innerHTML += `<p>${stat.statName.toUpperCase()}: ${stat.statValue}</p>`;
    });
}

/**
 * Displays a button to play the Pokémon's cry.
 * @param {string} pokemonSoundUrl - URL of the Pokémon's cry.
 * @param {string} dest - Destination element ID.
 */
function displaySoundButton(pokemonSoundUrl, dest) {
    const location = document.getElementById(dest);
    location.innerHTML += `<button onClick="pokemonCriesPlay('${pokemonSoundUrl}')">Play Pokémon Cry</button>`;
}

/**
 * Displays the Pokémon's evolution chain.
 * @param {object} data - Evolution chain data.
 * @param {string} dest - Destination element ID.
 */
async function displayEvolutionChain(data, dest) {
    const location = document.getElementById(dest);
    let evolutions = [data?.chain?.species?.name];

    if (data.chain.species.name === 'eevee') {
        data.chain.evolves_to.forEach(evo => {
            evolutions.push(evo.species.name);
        });
    }

    if (data.chain?.evolves_to?.[0]?.species?.name) {
        evolutions.push(data.chain.evolves_to[0].species.name);
    }

    if (data.chain?.evolves_to?.[0]?.evolves_to?.[0]?.species?.name) {
        evolutions.push(data.chain.evolves_to[0].evolves_to[0].species.name);
    }

    let evoSprites = await getEvolutionSprites(evolutions);

    evolutions.forEach((evo, index) => {
        const imageButton = document.createElement('button');
        const image = document.createElement('img');
        image.src = evoSprites[index];
        image.alt = `${evo} Image`;
        image.width = 75;
        image.height = 75;
        imageButton.appendChild(image);
        imageButton.addEventListener('click', () => takeMeTo(evo));
        location.appendChild(imageButton);

        if (index < evolutions.length - 1) {
            const arrow = document.createElement('p');
            arrow.textContent = '';
            location.appendChild(arrow);
        }
    });
}

/**
 * Navigates to a specific Pokémon's large card.
 * @param {string} pokemonName - Name of the Pokémon.
 */
async function takeMeTo(pokemonName) {
    const pokemonData = await findPokemonIndividual(pokemonName);
    await displayPokemonDataLARGECARD(pokemonData);
}

/**
 * Displays Pokémon sprites.
 * @param {array} sprites - Array of sprite URLs.
 * @param {string} dest - Destination element ID.
 */
function displaySprites(sprites, dest) {
    const location = document.getElementById(dest);
    sprites.forEach(sprite => {
        location.innerHTML += `<img src="${sprite}" alt="Pokemon Sprite" />`;
    });
}

// Sound Functions

/**
 * Plays the Pokémon's cry.
 * @param {string} url - URL of the Pokémon's cry.
 */
function pokemonCriesPlay(url) {
    const audio = new Audio(url);
    audio.play();
}

// Favorite Functions

/**
 * Toggles a Pokémon as a favorite.
 * @param {string} pokemonName - Name of the Pokémon.
 */
function setFavorite(pokemonName) {
    const index = FAVORITEPOKEMON.indexOf(pokemonName);

    if (index === -1) {
        FAVORITEPOKEMON.push(pokemonName);
    } else {
        FAVORITEPOKEMON.splice(index, 1);
    }

    displayFavButton(pokemonName, "buttonBox");
}

/**
 * Displays the favorite button.
 * @param {string} name - Name of the Pokémon.
 * @param {string} dest - Destination element ID.
 */
function displayFavButton(name, dest) {
    const buttonBox = document.getElementById(dest);
    const button = document.createElement('button');
    button.id = "favoriteButton";
    button.onclick = () => setFavorite(name);

    if (FAVORITEPOKEMON.includes(name)) {
        button.textContent = "UnFavorite";
        button.classList.add('favorited');
    } else {
        button.textContent = "Favorite";
        button.classList.remove('favorited');
    }

    buttonBox.innerHTML = `<button id="closeCard" onclick="closeLargeCard()">Close Card</button>`;
    buttonBox.appendChild(button);
}

/**
 * Closes the large card display.
 */
function closeLargeCard() {
    document.getElementById("LargeCardHolder").innerHTML = '';
}

// Event Listeners

/**
 * Event listener for card clicks to display large card.
 */
document.getElementById("grid-container").addEventListener('click', async function (event) {
    if (event.target.closest('.card')) {
        const card = event.target.closest('.card');
        const pokemonData = await findPokemonIndividual(card.id);
        await displayPokemonDataLARGECARD(pokemonData);
    }
});

/**
 * Formats text by capitalizing the first letter of each word.
 * @param {string} text - The text to format.
 * @returns {string} - The formatted text.
 */
function formatText(text) {
    return text
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

// Main Display Functions

/**
 * Displays Pokémon data as a mini card.
 * @param {object} data - Pokémon data object.
 */
async function displayPokemonDataMINICARD(data) {
    const gridContainer = document.getElementById("grid-container");
    const pokemonDisplayName = formatText(data.name)
    const rawName = data.name;
    const pokemonID = data.id;
    const types = getTypes(data);
    const typeImgUrls = await getPokemonTypeImg(types);
    const pokemonImage = getSprites(data)[0];

    gridContainer.innerHTML += `
        <div id="${rawName}" class="card">
            <h2>${pokemonDisplayName}</h2>
            <h3>ID: ${pokemonID}</h3>   
            <img src="${pokemonImage}" alt="Pokemon Sprite" />       
            <h4>Weight: ${data.weight}hg</h4>
            <h4>Height: ${data.height}dm</h4>  
        </div>
    `;
    displayTypes(types, typeImgUrls, rawName);
}

/**
 * Displays Pokémon data as a large card.
 * @param {object} data - Pokémon data object.
 */
async function displayPokemonDataLARGECARD(data) {
    const LargeCardHolder = document.getElementById("LargeCardHolder");
    const pokemonDisplayName = formatText(data.name)
    const rawName = data.name;
    const pokemonID = data.id;
    const types = getTypes(data);
    const typeImgUrls = await getPokemonTypeImg(types);
    const abilities = getAbilities(data);
    const moves = getMoves(data);
    const stats = getStats(data);
    const pokemonImages = getSprites(data);
    const pokemonSound = data?.cries?.latest || "";
    const evoChainURL = await getPokemonEvolutionChainID(pokemonID);

    LargeCardHolder.innerHTML = `
        <div id="${rawName.toLowerCase()}Card" class="cardExpanded">
            <div class="buttonBox" id="buttonBox">
                <button id="closeCard" onclick="closeLargeCard()">Close Card</button>
            </div>
            <div class="nameBox" id="nameBox">
                <h1>${pokemonDisplayName}</h1>
                <h2>ID: ${pokemonID}</h2>
                <h4>Weight: ${data.weight}hg</h4>
                <h4>Height: ${data.height}dm</h4>
            </div>
            <div class="sprites" id="sprites"></div>
            <div class="ability" id="ability"></div>
            <div class="moves" id="moves"></div>
            <div class="stats" id="stats"></div>
            <div class="evoChain" id="evoChain"><h4>Evolution Chain: </h4></div>
            <div class="soundButton" id="soundButton"></div>
        </div>
    `;

    displayFavButton(pokemonDisplayName.toLowerCase(), "buttonBox");
    displayTypes(types, typeImgUrls, "nameBox");
    if (pokemonSound) displaySoundButton(pokemonSound, "soundButton");
    displayAbilities(abilities, "ability");
    displayMoves(moves, "moves");
    displayStats(stats, "stats");
    displaySprites(pokemonImages, "sprites");

    if (evoChainURL === "NoEvos") {
        document.getElementById("evoChain").innerHTML = `<h4>No Evolution Chain For This Pokémon.</h4>`;
    } else {
        const evoChainData = await getPokemonEvolutionsTree(evoChainURL);
        await displayEvolutionChain(evoChainData, "evoChain");
    }
}