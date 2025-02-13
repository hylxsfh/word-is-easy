"use client";

import { useState, useEffect } from "react";
import Confetti from "react-confetti";
import { useHotkeys } from "react-hotkeys-hook";
import { useRouter } from 'next/navigation'; // 导入useRouter hook

type WordData = {
  name: string;
  trans: string[];
  // usphone: string;
};

export default function Home() {
  const router = useRouter(); // 初始化router

  //单词数组
  const [words, setWords] = useState<WordData[]>([]);
  //当前单词索引
  const [wordsIndex, setWordsIndex] = useState(0);

  //当前输入单词的字母数组
  const [inputLetters, setInputLetters] = useState<string[]>([]);
  //“将要”输入单词的字母索引
  const [inputLettersIndex, setInputLettersIndex] = useState(0);
  //当前单词的各个字母输入是正确还是错误的标志
  const [inputLettersErrors, setInputLettersErrors] = useState<boolean[]>([]);

  //单词的所有字母输入正确后显示烟花。同时通过它确定当前单词输入正确，等待烟花结束后跳转到下一个单词
  const [showConfetti, setShowConfetti] = useState(false);
  //是否播放单词读音
  const [isPlaying, setIsPlaying] = useState(false);

  const [isEnd, setIsEnd] = useState(false);

  //加载单词数据
  useEffect(() => {
    fetch("/XiaoXue1_1.json")
      .then((res) => res.json())
      .then((data) => {
        setWords(data);
      });
      
  }, []);

  //处理单词切换
  useEffect(() => {
    if (words.length == 0) {
      return;
    }

    setInputLetters(Array(words[wordsIndex].name.length).fill(""));
    setInputLettersIndex(0);
    setInputLettersErrors(Array(words[wordsIndex].name.length).fill(false));
    playWordAudio(words[wordsIndex].name);
  }, [words, wordsIndex])

  //监控全局按键：26个字母+回退键
  useHotkeys("a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, r, s, t, u, v, w, x, y, z, backspace", 
    (event) => {
      //显示烟花时，不处理输入
      if (showConfetti) {
        return;
      }

      //处理回退键。回退到上一个输入框，同时清除对应位置的输入字母和错误
      if (event.key === "Backspace") {
        const nextInputLettersIndex = inputLettersIndex - 1;
        setInputLettersIndex(nextInputLettersIndex > 0 ? nextInputLettersIndex : 0);

        const newInputs = [...inputLetters];
        newInputs.fill("", nextInputLettersIndex)
        setInputLetters(newInputs);

        const newInputsErrors = [...inputLettersErrors];
        newInputsErrors.fill(false, nextInputLettersIndex)
        setInputLettersErrors(newInputsErrors);

        console.log('backspace newInputs, newInputsErrors', newInputs, newInputsErrors);
        return;
      }

      //当前输入字母已超过单词长度，不处理
      const nextInputLettersIndex = inputLettersIndex + 1;
      if (nextInputLettersIndex > words[wordsIndex].name.length) {
        console.log('输入完成');
        return;
      }
      const newInputLetters = [...inputLetters];
      newInputLetters[inputLettersIndex] = event.key.toLowerCase();

      setInputLettersIndex(nextInputLettersIndex);
      setInputLetters(newInputLetters);
      console.log('input index and word', nextInputLettersIndex, newInputLetters);

      //当前输入已是最后一个字母
      if (words[wordsIndex].name.length === nextInputLettersIndex) {     
        //如果单词输入正确：清空各标志位并显示烟花。错误：设置对应的错误标志位
        if (words[wordsIndex].name.toLowerCase() === newInputLetters.join("").toLowerCase()) {
          console.log('正确');
          setShowConfetti(true);
          setTimeout(() => {
            setShowConfetti(false);
            if (wordsIndex === words.length - 1) {
              setIsEnd(true);
            } else {
              setWordsIndex((prev) => prev + 1);
            }
          }, 2000);
        } else {
          //循环当前单词的所有字母，与inputLetters中的字母做对比，不相同设置错误标志位
          const word = words[wordsIndex].name.toLowerCase();
          const newInputsErrors = newInputLetters.map((input, index) => input !== word[index])
          setInputLettersErrors(newInputsErrors);
        }        
        return;
      }

    }
  );

  //播放单词读音
  const playWordAudio =  async (word: string) => {
    console.log('发音', word);
    const audioUrl = `https://dict.youdao.com/dictvoice?audio=${word}&type=2`
    if (isPlaying) return;
    setIsPlaying(true);
    try {
      const audio = new Audio(audioUrl);
      audio.play();
      audio.addEventListener('ended', () => {
        console.log('发音结束');
        setIsPlaying(false);
      });
    } catch (error) {
      console.error("Error fetching audio:", error);
      setIsPlaying(false);
    }
  };

  //输入正确后，显示烟花
  const _ShowConfetti = () => {
    return (        
      <Confetti
        width={window.innerWidth}
        height={window.innerHeight}
        recycle={false}
        numberOfPieces={500}
        tweenDuration={500}

      />
    )
  }

  //本次练习完成时，显示“重新开始按钮”
  if (isEnd) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4 relative overflow-hidden">
        <div className="text-center">
          <h1 className="text-6xl font-bold mb-8">本轮练习完成</h1>
          <button
            onClick={() => {
              setWordsIndex(0);
              setIsEnd(false);
              setInputLettersIndex(0);
              setInputLetters(Array(words[0].name.length).fill(""));
              setInputLettersErrors(Array(words[0].name.length).fill(false));
            }}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded text-2xl"
          >
            重新开始
          </button>
        </div>
      </div>
    );
  }

  //显示当前单词练习页面
  const currentWord = words[wordsIndex];
  if (!currentWord) {
    return;
  }
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4 relative">
      {showConfetti && (
        <_ShowConfetti />
      )}
      <div className="absolute top-4 right-4">
        <button
          onClick={() => router.push('/')}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          返回主页
        </button>
      </div>
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-2">

          {/* 单词 */}
          { <h1 className="text-6xl font-bold">{currentWord.name}</h1>  }

          {/* 播放按钮 */}
          <button 
            onClick={() => playWordAudio(currentWord.name)}
            disabled={isPlaying}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <span className={`text-6xl ${isPlaying ? 'text-gray-400' : 'text-gray-600'}`}>🗣</span>
            {/* <span className={`text-6xl text-gray-600`}>🗣</span> */}
          </button>
        </div>

        {/* 音标 暂不使用*/}
        {/* <p className="text-gray-600 text-4xl">
          【{currentWord.usphone}】
        </p> */}

        {/* 中文翻译 */}
        <h1 className="text-4xl font-bold">{currentWord.trans.join(", ")}</h1>
      </div>
      
      {/* 输入框 */}
      <div className="flex gap-2">
        {inputLetters.map((value, index) => (
          <input
            key={index}
            type="text"
            maxLength={1}
            value={value}
            disabled
            className={`h-20 w-20 rounded border-2 text-center text-4xl font-bold focus:outline-none ${
              inputLettersErrors[index] 
                ? "border-red-500" 
                : ""                
            } ${
              index === inputLettersIndex 
                ? "border-blue-500" 
                : "border-gray-300"                
            }`}
          />
        ))}
      </div>
    </div>
  );
}