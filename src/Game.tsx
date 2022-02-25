import { useEffect, useRef, useState } from "react";
import { Row, RowState } from "./Row";
import dictionary from "./dictionary.json";
import { Clue, clue, describeClue, violation } from "./clue";
import { Keyboard } from "./Keyboard";
import targetList from "./targets.json";
import {
  dictionarySet,
  Difficulty,
  pick,
  resetRng,
  seed,
  speak,
  urlParam,
} from "./util";
import { decode, encode } from "./base64";

enum GameState {
  Playing,
  Won,
  Lost,
  Completed
}

interface GameProps {
  maxGuesses: number;
  hidden: boolean;
  difficulty: Difficulty;
  colorBlind: boolean;
  keyboardLayout: string;
}

const targets = targetList.slice(0, targetList.indexOf("zings") + 1); // Choose target words
const minWordLength = 4;
const maxWordLength = 11;
const startDate = new Date(2022, 1, 1);

function getDifferenceInDays(date1: any, date2: any)
{
  const diffInDays = Math.abs(date2 - date1);
  return diffInDays / ((1000 * 60 * 60 * 24));
}

function dailyTarget()
{
	let day = getDifferenceInDays(startDate, new Date());
	//let day = getDifferenceInDays(startDate, startDate);
	console.log(day);

	return targets[Math.floor(day)];
}

function randomTarget(wordLength: number): string {
  const eligible = targets.filter((word) => word.length === wordLength);
  let candidate: string;
  do {
    candidate = pick(eligible);
  } while (/\*/.test(candidate));
  return candidate;
}

function getChallengeUrl(target: string): string {
  return (
    window.location.origin +
    window.location.pathname +
    "?challenge=" +
    encode(target)
  );
}

let initChallenge = "";
let challengeError = false;
try {
  initChallenge = decode(urlParam("challenge") ?? "").toLowerCase();
} catch (e) {
  console.warn(e);
  challengeError = true;
}
if (initChallenge && !dictionarySet.has(initChallenge)) {
  initChallenge = "";
  challengeError = true;
}

function Game(props: GameProps) {
  var stats =
  {
	"wins": 0,
	"losses": 0,
	"streak": 0,
	"oneWins": 0,
	"twoWins": 0,
	"threeWins": 0,
	"fourWins": 0,
	"fiveWins": 0,
	"sixWins": 0
  };
  var progress =
  {
	"guessList": [],
	"current": "",
	"lastTarget": "",
	"dailyComplete": false
  };
  if (localStorage.getItem('stats') ===  null)
  {
	localStorage.setItem('stats', JSON.stringify(stats));
  }
  if (localStorage.getItem('progress') ===  null)
  {
	localStorage.setItem('progress', JSON.stringify(progress));
  }
  const [gameState, setGameState] = useState(GameState.Playing);
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState<string>("");
  const [hint, setHint] = useState<string>(
    challengeError
      ? `Invalid challenge string, playing random game.`
      : `Make your first guess!`
  );
  const [challenge, setChallenge] = useState<string>(initChallenge);
  const [wordLength, setWordLength] = useState(
    challenge ? challenge.length : 5
  );
  const [target, setTarget] = useState(() => {
    resetRng();
	return challenge || dailyTarget();
    //return challenge || randomTarget(wordLength);
  });
  const [gameNumber, setGameNumber] = useState(1);
  const tableRef = useRef<HTMLTableElement>(null);
  
  const startNextGame = () => {
    if (challenge) {
      // Clear the URL parameters:
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    setChallenge("");
    const newWordLength =
      wordLength < minWordLength || wordLength > maxWordLength ? 5 : wordLength;
    setWordLength(newWordLength);
    setTarget(randomTarget(newWordLength));
    setGuesses([]);
    setCurrentGuess("");
    setHint("");
    setGameState(GameState.Playing);
    setGameNumber((x) => x + 1);
	// test
	progress = JSON.parse(localStorage.getItem('progress') || "");
	setCurrentGuess(progress.current);
	setGuesses(progress.guessList);
	console.log("Guess list: " + guesses + "\n" + "current: " + currentGuess);
    setCurrentGuess((guess) => "");
	speak(describeClue(clue(currentGuess, target)));
	// end test
  };

  async function share(url: string, copiedHint: string, text?: string) {
    const body = url + (text ? "\n\n" + text : "");
    if (
      /android|iphone|ipad|ipod|webos/i.test(navigator.userAgent) &&
      !/firefox/i.test(navigator.userAgent)
    ) {
      try {
        await navigator.share({ text: body });
        return;
      } catch (e) {
        console.warn("navigator.share failed:", e);
      }
    }
    try {
      await navigator.clipboard.writeText(body);
      setHint(copiedHint);
      return;
    } catch (e) {
      console.warn("navigator.clipboard.writeText failed:", e);
    }
    setHint(url);
  }
  
  // Load stuffs
  window.onload = function()
  {
	progress = JSON.parse(localStorage.getItem('progress') || "");
	if(progress.lastTarget === target)
	{
		setCurrentGuess(progress.current);
		setGuesses(progress.guessList);
		if(progress.current !== "")
			setGuesses((guesses) => guesses.concat([progress.current]));
		setCurrentGuess((guess) => "");
		speak(describeClue(clue(currentGuess, target)));
		
		if(progress.guessList !== [])
		{
			setHint("");
		
			if(progress.guessList.length + 1 === props.maxGuesses)
				setHint("No more tries today. Come back tomorrow!");
		}
		
		if(progress.dailyComplete === true)
			setGameState(GameState.Completed);
	}
	else
	{
		progress.lastTarget = target;
		progress.dailyComplete = false;
		localStorage.setItem('progress', JSON.stringify(progress));
	}
  }  
  
  const onKey = (key: string) => {
    if (gameState !== GameState.Playing) {
      if (key === "Enter") {
        setHint("No more tries today. Come back tomorrow!");
      }
      return;
    }
    if (guesses.length === props.maxGuesses) return;
    if (/^[a-z]$/i.test(key)) {
      setCurrentGuess((guess) =>
        (guess + key.toLowerCase()).slice(0, wordLength)
      );
      tableRef.current?.focus();
      setHint("");
    } else if (key === "Backspace") {
      setCurrentGuess((guess) => guess.slice(0, -1));
      setHint("");
    } else if (key === "Enter") {
      if (currentGuess.length !== wordLength) {
        setHint("Too short\n" + target + "\nstats: " + JSON.stringify(stats) + "\nlocalStorage Stats: " + localStorage.getItem('stats') + "\nProgress: " + localStorage.getItem('progress'));
        return;
      }
      if (!dictionary.includes(currentGuess)) {
        setHint("Not a valid word");
        return;
      }
      for (const g of guesses) {
        const c = clue(g, target);
        const feedback = violation(props.difficulty, c, currentGuess);
        if (feedback) {
          setHint(feedback);
          return;
        }
      }
      setGuesses((guesses) => guesses.concat([currentGuess]));
      setCurrentGuess((guess) => "");	  
	  var tStreak = JSON.parse(localStorage.stats).streak;
      const gameOver = (verbed: string) =>
        `You ${verbed}! The answer was ${target.toUpperCase()}.\nYour current wins: ${JSON.parse(localStorage.stats).wins}\nYour win streak: ${tStreak}`;

	  var tStats = JSON.parse(localStorage.getItem('stats') || "");
	  var tProgress = JSON.parse(localStorage.getItem('progress') || "");
      if (currentGuess === target) {
	    tStats.wins += 1;
		tStats.streak += 1;
		tProgress.dailyComplete = true;
		
		switch (guesses.length + 1)
		{
			case 1: tStats.oneWins += 1;
			break;
			case 2: tStats.twoWins += 1;
			break;
			case 3: tStats.threeWins += 1;
			break;
			case 4: tStats.fourWins += 1;
			break;
			case 5: tStats.fiveWins += 1;
			break;
			case 6: tStats.sixWins += 1;
			break;
		}		
		
		tStreak = tStats.streak;	
		localStorage.setItem('stats', JSON.stringify(tStats)); // Store wins and current win streak		
        setHint(gameOver("won"));
        setGameState(GameState.Won);
      } else if (guesses.length + 1 === props.maxGuesses) {
		var tStats = JSON.parse(localStorage.getItem('stats') || "");
		tStats.losses += 1;
	    tStats.streak = 0;
		tProgress.dailyComplete = true;
		tStreak = tStats.streak;
		localStorage.setItem('stats', JSON.stringify(tStats)); // Reset win streak
        setHint(gameOver("lost"));
        setGameState(GameState.Lost);
      } else {
        setHint("");
        speak(describeClue(clue(currentGuess, target)));
      }
	  tProgress.guessList = guesses;
	  tProgress.current = currentGuess;
	  localStorage.setItem('progress', JSON.stringify(tProgress)); // Store guesses and current guess
    }
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!e.ctrlKey && !e.metaKey) {
        onKey(e.key);
		console.log("key down");
      }
      if (e.key === "Backspace") {
        e.preventDefault();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [currentGuess, gameState]);

  let letterInfo = new Map<string, Clue>();
  const tableRows = Array(props.maxGuesses)
    .fill(undefined)
    .map((_, i) => {
      const guess = [...guesses, currentGuess][i] ?? "";
      const cluedLetters = clue(guess, target);
      const lockedIn = i < guesses.length;
      if (lockedIn) {
        for (const { clue, letter } of cluedLetters) {
          if (clue === undefined) break;
          const old = letterInfo.get(letter);
          if (old === undefined || clue > old) {
            letterInfo.set(letter, clue);
          }
        }
      }
      return (
        <Row
          key={i}
          wordLength={wordLength}
          rowState={
            lockedIn
              ? RowState.LockedIn
              : i === guesses.length
              ? RowState.Editing
              : RowState.Pending
          }
          cluedLetters={cluedLetters}
        />
      );
    });

  return (
    <div className="Game" style={{ display: props.hidden ? "none" : "block" }}>
      <table
        className="Game-rows"
        tabIndex={0}
        aria-label="Table of guesses"
        ref={tableRef}
      >
        <tbody>{tableRows}</tbody>
      </table>
      <p
        role="alert"
        style={{
          userSelect: /https?:/.test(hint) ? "text" : "none",
          whiteSpace: "pre-wrap",
        }}
      >
        {hint || `\u00a0`}
      </p>
      <Keyboard
        layout={props.keyboardLayout}
        letterInfo={letterInfo}
        onKey={onKey}
      />
      {gameState !== GameState.Playing && (
        <p>
          <button
            onClick={() => {
              share(
                getChallengeUrl(target),
                "Challenge link copied to clipboard!"
              );
            }}
          >
            Challenge a friend to this word
          </button>{" "}
          <button
            onClick={() => {
              const emoji = props.colorBlind
                ? ["⬛", "🟦", "🟧"]
                : ["⬛", "🟨", "🟩"];
              share(
                getChallengeUrl(target),
                "Result copied to clipboard!",
                guesses
                  .map((guess) =>
                    clue(guess, target)
                      .map((c) => emoji[c.clue ?? 0])
                      .join("")
                  )
                  .join("\n")
              );
            }}
          >
            Share emoji results
          </button>
        </p>
      )}
      {challenge ? (
        <div className="Game-seed-info">playing a challenge game</div>
      ) : seed ? (
        <div className="Game-seed-info">
          seed {seed}, length {wordLength}, game {gameNumber}
        </div>
      ) : undefined}
    </div>
  );
}

export default Game;
