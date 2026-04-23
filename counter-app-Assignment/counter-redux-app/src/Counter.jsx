import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { increment, decrement } from "./counterSlice";

const Counter = () => {
  const count = useSelector((state) => state.counter.value);
  const dispatch = useDispatch();

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-md border border-slate-200 p-8">
        <p className="text-sm font-medium text-slate-500 mb-2">Counter</p>

        <h1 className="text-6xl font-bold text-slate-800 text-center mb-8">
          {count}
        </h1>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => dispatch(decrement())}
            className="py-3 rounded-xl bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 transition duration-200"
          >
            Decrease
          </button>

          <button
            onClick={() => dispatch(increment())}
            className="py-3 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 transition duration-200"
          >
            Increase
          </button>
        </div>
      </div>
    </div>
  );
};

export default Counter;