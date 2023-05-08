import './App.css';
import { useState, useEffect } from 'react';
import { decode } from "deckstrings";

var cards;

const deckOneString = decode("AAECAfHhBALLpQXMpQUOlrcE9eMEguQEk+QE2fEEsvcEtvcEtIAFk4EFkpMFoJkFopkFrqEFnqoFAA==");
const deckTwoString = decode("AAECAfHhBALLpQXMpQUOlrcE9eMEguQEk+QE2fEEsvcEtvcEtIAFk4EFkpMFoJkFopkFrqEFnqoFAA==");

async function getCards() {
  const options = {
    hostname: 'api.hearthstonejson.com',
    path: '/v1/latest/enUS/cards.collectible.json',
    method: 'GET'
  };
  async function fetchData(url) {
    const response = await fetch(url);
    if (response.status === 302) {
      const newLocation = response.headers.get("location");
      return fetchData(newLocation);
    } else {
      const data = await response.json();
      return data;
    }
  }
  try {
    const url = `https://${options.hostname}${options.path}`;
    cards = await fetchData(url);
    return cards;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

function compareDecks(deckOne, deckTwo) {
	return deckOne.map(cardOne => {
		const cardTwo = deckTwo.find(c => c.dbfId === cardOne.dbfId);
		if (!cardTwo) {
			return { ...cardOne, comparison: 'not-in-deck' };
		}
		if (cardOne.count === cardTwo.count) {
			return { ...cardOne, comparison: 'same-count' };
		}
		return { ...cardOne, comparison: 'different-count' };
	});
}

function App() {
	const [deckOne, setDeckOne] = useState([]);
	const [deckTwo, setDeckTwo] = useState([]);

	useEffect(() => {
		async function fetchDataAndInitialize() {
			await getCards();
			var deckOne = [];
			var deckTwo = [];
			for (let i = 0; i < deckOneString.cards.length; i++) {
				let card = cards.find(c => c.dbfId === deckOneString.cards[i][0]); // Find the card object with the matching id
				card["count"] = deckOneString.cards[i][1];
				deckOne.push(card);
			}
			for (let i = 0; i < deckTwoString.cards.length; i++) {
				let card = cards.find(c => c.dbfId === deckTwoString.cards[i][0]); // Find the card object with the matching id
				card["count"] = deckTwoString.cards[i][1];
				deckTwo.push(card);
			}
			deckOne.sort((a, b) => a.cost - b.cost);
			deckTwo.sort((a, b) => a.cost - b.cost);
			for (let i = 0; i < deckOne.length; i++) {
				console.log("hello");
			}
			setDeckOne(deckOne);
			setDeckTwo(deckTwo);
		}

		fetchDataAndInitialize();
	}, []);
  return (
    <div id="main">
      <table id="deckOne">
        <tbody>
          {deckOne.map((item, index) => (
            <tr key={index}>
              <td>{item.cost}</td>
              <td>{item.name}</td>
              <td>{item.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
	<table id="deckTwo">
        <tbody>
          {deckTwo.map((item, index) => (
            <tr key={index}>
              <td>{item.cost}</td>
              <td>{item.name}</td>
              <td>{item.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default App
