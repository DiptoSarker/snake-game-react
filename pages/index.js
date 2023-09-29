import dynamic from "next/dynamic";
import { useEffect, useState, useRef } from "react";
import styles from "../styles/Snake.module.css";

const Config = {
  height: 22,
  width: 25,
  cellSize: 32,
};

const CellType = {
  Snake: "snake",
  Food: "food",
  Empty: "empty",
};

const Direction = {
  Left: { x: -1, y: 0 },
  Right: { x: 1, y: 0 },
  Top: { x: 0, y: -1 },
  Bottom: { x: 0, y: 1 },
};

const Cell = ({ x, y, type }) => {
  const getStyles = () => {
    switch (type) {
      case CellType.Snake:
        return {
          backgroundColor: "yellowgreen",
          borderRadius: 8,
          padding: 2,
        };

      case CellType.Food:
        return {
          backgroundColor: "darkorange",
          borderRadius: 20,
          width: 32,
          height: 32,
        };

      default:
        return {};
    }
  };
  return (
    <div
      className={styles.cellContainer}
      style={{
        left: x * Config.cellSize,
        top: y * Config.cellSize,
        width: Config.cellSize,
        height: Config.cellSize,
      }}
    >
      <div className={styles.cell} style={getStyles()}></div>
    </div>
  );
};

const getRandomCell = () => ({
  x: Math.floor(Math.random() * Config.width),
  y: Math.floor(Math.random() * Config.width),
});

const Snake = () => {
  const getDefaultSnake = () => [
    { x: 8, y: 12 },
    { x: 7, y: 12 },
    { x: 6, y: 12 },
  ];
  const grid = useRef();

  // snake[0] is head and snake[snake.length - 1] is tail
  const [snake, setSnake] = useState(getDefaultSnake());
  const [direction, setDirection] = useState(Direction.Right);
  const [food, setFood] = useState({ x: 4, y: 10 });
  const [score, setScore] = useState(0);

  // move the snake
  useEffect(() => {
    // ekhane vai food include kora hoise
    const generateNewFood = () => {
      let newFood;
      do {
        newFood = getRandomCell();
      } while (isSnake(newFood));
      setFood(newFood);
    };
    const foodGeneratorTimer = setInterval(generateNewFood, 3000);

    // ekhane vai check korci head er sathe r kono snake array er position same hoy kina r boundary checking korsi
    const runSingleStep = () => {
      setSnake((snake) => {
        const head = snake[0];
        const newHead = { x: head.x + direction.x, y: head.y + direction.y };
        for (let i = 1; i < snake.length; i++) {
          if (snake[i].x === newHead.x && snake[i].y === newHead.y) {
            setScore(0);
            return getDefaultSnake();
          }
        }

        //ekhane ulta direction diye sap ber korsi vai ....
        if (
          newHead.x < 0 ||
          newHead.x >= Config.width ||
          newHead.y < 0 ||
          newHead.y >= Config.height
        ) {
          if (newHead.x < 0) newHead.x = Config.width - 1;
          else if (newHead.x >= Config.width) newHead.x = 0;
          else if (newHead.y < 0) newHead.y = Config.height - 1;
          else if (newHead.y >= Config.height) newHead.y = 0;
        }

        // ekhane vai score baraisi & food add korsi each time food khaoar por
        const isHeadOnFood = isFood(newHead);
        const newSnake = [newHead, ...snake];
        if (isHeadOnFood) {
          generateNewFood();
          setScore((score) => score + 0.5);
        } else {
          newSnake.pop();
        }
        return newSnake;
      });
    };
    const gameTimer = setInterval(runSingleStep, 200);
    const foodRemovalTimer = setInterval(() => setFood(null), 10000);
    return () => {
      clearInterval(foodGeneratorTimer);
      clearInterval(gameTimer);
      clearInterval(foodRemovalTimer);
    };
  }, [direction]);

  // update score whenever head touches a food
  useEffect(() => {
    const head = snake[0];
    if (isFood(head)) {
      // setScore((score) => {
      //   return score + 1;
      // });
      setSnake((snake) => {
        const newSnake = [...snake];
        const newTail = { ...newSnake[newSnake.length - 1] };
        newSnake.push(newTail);
        return newSnake;
      });

      let newFood = getRandomCell();
      while (isSnake(newFood)) {
        newFood = getRandomCell();
      }

      setFood(newFood);
    }
  }, [snake]);

  useEffect(() => {
    const handleNavigation = (event) => {
      let dx = 0;
      let dy = 0;

      switch (event.key) {
        case "ArrowUp":
          dy = -1;
          break;

        case "ArrowDown":
          dy = 1;
          break;

        case "ArrowLeft":
          dx = -1;
          break;

        case "ArrowRight":
          dx = 1;
          break;

        default:
          return;
      }

      if (dx !== 0 && direction.x !== -dx) {
        setDirection({ x: dx, y: 0 });
      } else if (dy !== 0 && direction.y !== -dy) {
        setDirection({ x: 0, y: dy });
      }
    };

    window.addEventListener("keydown", handleNavigation);

    return () => window.removeEventListener("keydown", handleNavigation);
  }, [direction]);

  // ?. is called optional chaining
  // see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining
  const isFood = ({ x, y }) => food?.x === x && food?.y === y;

  const isSnake = ({ x, y }) =>
    snake.find((position) => position.x === x && position.y === y);

  const cells = [];
  for (let x = 0; x < Config.width; x++) {
    for (let y = 0; y < Config.height; y++) {
      let type = CellType.Empty;
      if (isFood({ x, y })) {
        type = CellType.Food;
      } else if (isSnake({ x, y })) {
        type = CellType.Snake;
      }
      cells.push(<Cell key={`${x}-${y}`} x={x} y={y} type={type} />);
    }
  }

  return (
    <div className={styles.container}>
      <div
        className={styles.header}
        style={{ width: Config.width * Config.cellSize }}
      >
        Score: {score}
      </div>
      <div
        className={styles.grid}
        style={{
          height: Config.height * Config.cellSize,
          width: Config.width * Config.cellSize,
        }}
      >
        {cells}
      </div>
    </div>
  );
};

export default dynamic(() => Promise.resolve(Snake), {
  ssr: false,
});
