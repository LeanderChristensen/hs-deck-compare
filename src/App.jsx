import './App.css';
import { useState, useEffect } from 'react';
import { decode } from 'deckstrings';

var cards;

async function getCards() {
	const options = {
		hostname: 'api.hearthstonejson.com',
		path: '/v1/latest/enUS/cards.collectible.json',
		method: 'GET',
	};
	async function fetchData(url) {
		const response = await fetch(url);
		if (response.status === 302) {
			const newLocation = response.headers.get('location');
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
	return deckOne.map((cardOne) => {
		const cardTwo = deckTwo.find((c) => c.dbfId === cardOne.dbfId);
		if (!cardTwo) {
			return { ...cardOne, comparison: 0 };
		}
		if (cardOne.count === cardTwo.count) {
			return { ...cardOne, comparison: 1 };
		}
		return { ...cardOne, comparison: 2 };
	});
}

function App() {
	const [deckOne, setDeckOne] = useState([]);
	const [deckTwo, setDeckTwo] = useState([]);
	const [deckOneComparison, setDeckOneComparison] = useState([]);
	const [deckTwoComparison, setDeckTwoComparison] = useState([]);
	const [formData, setFormData] = useState({formDeckOne: "", formDeckTwo: ""});
	const [formSubmitted, setFormSubmitted] = useState(false);

	const handleChange = (event) => {
		setFormData({...formData, [event.target.name]: event.target.value});
	};

	const handleKeyDown = (event) => {
		if (event.key === "Enter") {
		  handleSubmit(event);
		}
	};

	const handleSubmit = (event) => {
		event.preventDefault();
		setFormSubmitted(true);
		fetchDataAndInitialize(decode(document.getElementById("deckOneInput").value), decode(document.getElementById("deckTwoInput").value));
	};

	useEffect(() => {
		if (deckOne.length > 0 && deckTwo.length > 0) {
			setDeckOneComparison(compareDecks(deckOne, deckTwo));
			setDeckTwoComparison(compareDecks(deckTwo, deckOne));
		}
	}, [deckOne, deckTwo]);
	async function fetchDataAndInitialize(deckOneString, deckTwoString) {
		await getCards();
		var deckOne = [];
		var deckTwo = [];
		for (let i = 0; i < deckOneString.cards.length; i++) {
			let card = cards.find((c) => c.dbfId === deckOneString.cards[i][0]);
			let newCard = { ...card, count: deckOneString.cards[i][1] };
			deckOne.push(newCard);
		}
		for (let i = 0; i < deckTwoString.cards.length; i++) {
			let card = cards.find((c) => c.dbfId === deckTwoString.cards[i][0]);
			let newCard = { ...card, count: deckTwoString.cards[i][1] };
			deckTwo.push(newCard);
		}
		deckOne.sort((a, b) => a.cost - b.cost);
		deckTwo.sort((a, b) => a.cost - b.cost);
		setDeckOne(deckOne);
		setDeckTwo(deckTwo);
	}
	return (
		<div id="main">
			<form onSubmit={handleSubmit}>
				<input id="deckOneInput" name="formDeckOne" placeholder="Deck One" value={formData.formDeckOne} onChange={handleChange} onKeyDown={handleKeyDown} />
				<input id="deckTwoInput" name="formDeckTwo" placeholder="Deck Two" value={formData.formDeckTwo} onChange={handleChange} onKeyDown={handleKeyDown} />
			</form>
			{formSubmitted && (
			<>
			<table id="deckOne">
				<tbody>
					{deckOneComparison.map((item, index) => (
						<tr
							key={index}
							style={{
								backgroundColor:
									item.comparison === 0
									? "rgba(255, 0, 0, 0.5)"
									: item.comparison === 2
									? "rgba(255, 165, 0, 0.5)"
									: "transparent",
							}}
						>
							<td 
className="tableMana"><span className="numberBorder">{item.cost}</span><img src="./mana_icon.webp"/></td>
							<td className={`tableName ${item.rarity}`}>{item.name}</td>
							<td className="tableCount"><span className="numberBorder">{item.count}</span></td>
						</tr>
					))}
				</tbody>
			</table>
			<table id="deckTwo">
				<tbody>
					{deckTwoComparison.map((item, index) => (
						<tr
							key={index}
							style={{
								backgroundColor:
									item.comparison === 0
									? "rgba(255, 0, 0, 0.5)"
									: item.comparison === 2
									? "rgba(255, 165, 0, 0.5)"
									: "transparent",
							}}
						>
							<td 
className="tableMana"><span className="numberBorder">{item.cost}</span><img src="./mana_icon.webp"/></td>
							<td className={`tableName ${item.rarity}`}>{item.name}</td>
							<td className="tableCount"><span className="numberBorder">{item.count}</span></td>
						</tr>
					))}
				</tbody>
			</table>
			</>
			)}
		</div>
	);
}

export default App;
