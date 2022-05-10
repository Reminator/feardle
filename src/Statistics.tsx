
export function Statistics()
{
	// Determine stats
	var wins = JSON.parse(localStorage.stats).wins;
	var losses = JSON.parse(localStorage.stats).losses;
	var played = wins + losses;
	var winPercentage = 0;
		
	if(played !== 0)
	{
		winPercentage = Math.round(wins / played * 100);
	}
	
	// Set up guess distribution
	var graphBarStyle1 =
	{
		width: '6%',
		backgroundColor: 'rgb(162, 162, 162)'
	};
	
	var graphBarStyle2 =
	{
		width: '6%',
		backgroundColor: 'rgb(162, 162, 162)'
	};
	
	var graphBarStyle3 =
	{
		width: '6%',
		backgroundColor: 'rgb(162, 162, 162)'
	};
	
	var graphBarStyle4 =
	{
		width: '6%',
		backgroundColor: 'rgb(162, 162, 162)'
	};
	
	var graphBarStyle5 =
	{
		width: '6%',
		backgroundColor: 'rgb(162, 162, 162)'
	};
	
	var graphBarStyle6 =
	{
		width: '6%',
		backgroundColor: 'rgb(162, 162, 162)'
	};	
	
	var guesses = JSON.parse(localStorage.progress).guessNumber;
	var oneGuess = JSON.parse(localStorage.stats).oneWins;
	var twoGuess = JSON.parse(localStorage.stats).twoWins;
	var threeGuess = JSON.parse(localStorage.stats).threeWins;
	var fourGuess = JSON.parse(localStorage.stats).fourWins;
	var fiveGuess = JSON.parse(localStorage.stats).fiveWins;
	var sixGuess = JSON.parse(localStorage.stats).sixWins;
	var highestGuess = 0;	
	
	// Set today's correct guesses to green
	switch (guesses)
	{
		case 1: graphBarStyle1.backgroundColor = 'rgb(87, 172, 120)';
				break;
		case 2: graphBarStyle2.backgroundColor = 'rgb(87, 172, 120)';
				break;
		case 3: graphBarStyle3.backgroundColor = 'rgb(87, 172, 120)';
				break;
		case 4: graphBarStyle4.backgroundColor = 'rgb(87, 172, 120)';
				break;
		case 5: graphBarStyle5.backgroundColor = 'rgb(87, 172, 120)';
				break;
		case 6: graphBarStyle6.backgroundColor = 'rgb(87, 172, 120)';
				break;
	}
	
	// Find percentage breakdown of guess distribution
	if(oneGuess > highestGuess)
	{
		highestGuess = oneGuess;
	}
	if(twoGuess > highestGuess)
	{
		highestGuess = twoGuess;
	}
	if(threeGuess > highestGuess)
	{
		highestGuess = threeGuess;
	}
	if(fourGuess > highestGuess)
	{
		highestGuess = fourGuess;
	}
	if(fiveGuess > highestGuess)
	{
		highestGuess = fiveGuess;
	}
	if(sixGuess > highestGuess)
	{
		highestGuess = sixGuess;
	}
	
	var tempPercent = 0;
	
	if(highestGuess !== 0)
	{
		// One guess
		tempPercent = oneGuess / highestGuess;
		if(tempPercent !== 1)
		{
			if(tempPercent !== 0)
				tempPercent = tempPercent * 100;
			else
				tempPercent = tempPercent * 100 + 6;
		}
		else
			tempPercent = 100;
		graphBarStyle1.width = JSON.stringify(tempPercent) + "%";
		
		// Two guess
		tempPercent = twoGuess / highestGuess;
		if(tempPercent !== 1)
		{
			if(tempPercent !== 0)
				tempPercent = tempPercent * 100;
			else
				tempPercent = tempPercent * 100 + 6;
		}
		else
			tempPercent = 100;
		graphBarStyle2.width = JSON.stringify(tempPercent) + "%";
		
		// Three guess
		tempPercent = threeGuess / highestGuess;
		if(tempPercent !== 1)
		{
			if(tempPercent !== 0)
				tempPercent = tempPercent * 100;
			else
				tempPercent = tempPercent * 100 + 6;
		}
		else if(tempPercent === 1)
			tempPercent = 100;
		graphBarStyle3.width = JSON.stringify(tempPercent) + "%";
		
		// Four guess
		tempPercent = fourGuess / highestGuess;
		if(tempPercent !== 1)
		{
			if(tempPercent !== 0)
				tempPercent = tempPercent * 100;
			else
				tempPercent = tempPercent * 100 + 6;
		}
		else if(tempPercent === 1)
			tempPercent = 100;
		graphBarStyle4.width = JSON.stringify(tempPercent) + "%";
		
		// Five guess
		tempPercent = fiveGuess / highestGuess;
		if(tempPercent !== 1)
		{
			if(tempPercent !== 0)
				tempPercent = tempPercent * 100;
			else
				tempPercent = tempPercent * 100 + 6;
		}
		else if(tempPercent === 1)
			tempPercent = 100;
		graphBarStyle5.width = JSON.stringify(tempPercent) + "%";
		
		// Six guess
		tempPercent = sixGuess / highestGuess;
		if(tempPercent !== 1)
		{
			if(tempPercent !== 0)
				tempPercent = tempPercent * 100;
			else
				tempPercent = tempPercent * 100 + 6;
		}
		else if(tempPercent === 1)
			tempPercent = 100;
		graphBarStyle6.width = JSON.stringify(tempPercent) + "%";
	}

	return (

	<div className="App-statistics">
		<h2>Statistics</h2>
		<div id="statistics">
			<div className="statistic-container">
				<div className="statistic">{played}</div>
				<div><b>Played</b></div>
			</div>
			<div className="statistic-container">
				<div className="statistic">{winPercentage}%</div>
				<div><b>Win %</b></div>
			</div>
			<div className="statistic-container">
				<div className="statistic">{JSON.parse(localStorage.stats).streak}</div>
				<div><b>Current Streak</b></div>
			</div>
			<div className="statistic-container">
				<div className="statistic">{JSON.parse(localStorage.stats).maxStreak}</div>
				<div><b>Max Streak</b></div>
			</div>
		</div>
		<h2>Guess Distribution</h2>
		<div id="guess-distribution">
			<div className="graph-container">
				<div className="guess">1</div>
				<div className="graph">
					<div className="graph-bar align-right highlight" style={graphBarStyle1}>
					  <div className="num-guesses">{oneGuess}</div>
					</div>
				</div>
			</div>
			<div className="graph-container">
				<div className="guess">2</div>
				<div className="graph">
					<div className="graph-bar align-right highlight" style={graphBarStyle2}>
					  <div className="num-guesses">{twoGuess}</div>
					</div>
				</div>
			</div>
			<div className="graph-container">
				<div className="guess">3</div>
				<div className="graph">
					<div className="graph-bar align-right highlight" style={graphBarStyle3}>
					  <div className="num-guesses">{threeGuess}</div>
					</div>
				</div>
			</div>
			<div className="graph-container">
				<div className="guess">4</div>
				<div className="graph">
					<div className="graph-bar align-right highlight" style={graphBarStyle4}>
					  <div className="num-guesses">{fourGuess}</div>
					</div>
				</div>
			</div>
			<div className="graph-container">
				<div className="guess">5</div>
				<div className="graph">
					<div className="graph-bar align-right highlight" style={graphBarStyle5}>
					  <div className="num-guesses">{fiveGuess}</div>
					</div>
				</div>
			</div>
			<div className="graph-container">
				<div className="guess">6</div>
				<div className="graph">
					<div className="graph-bar align-right highlight" style={graphBarStyle6}>
					  <div className="num-guesses">{sixGuess}</div>
					</div>
				</div>
			</div>
		</div>
	</div>
	);
}
