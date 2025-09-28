import  { useState, useEffect, useRef } from "react";

const Search = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<string[]>([]);

  // Mock dataset (replace with API later)
  const data = [
    "Apple",
    "Banana",
    "Orange",
    "Grapes",
    "Mango",
    "Strawberry",
    "Pineapple",
  ];

  let timeoutRef=useRef<number|null>(null)

  const handleSearchquery=(q:string)=>{
    if(timeoutRef.current){
        clearTimeout(timeoutRef.current)
    }
    timeoutRef.current=setTimeout(() => {
         const filtered = data.filter((item) =>
        item.toLowerCase().includes(q.toLowerCase())
      );
      setResults(filtered);
    }, 500);
    
  }

  useEffect(() => {
    if (query.trim() === "") {
      setResults(data);
    } else {

      // Here you can later plug your debounce + API call

      handleSearchquery(query)
    }
  }, [query]);

  return (
    <div className="max-w-md mx-auto mt-10 p-4 border rounded-xl shadow-sm">
      <input
        type="text"
        placeholder="Search fruits..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <ul className="mt-3 space-y-2">
        {results.length > 0 ? (
          results.map((item, idx) => (
            <li
              key={idx}
              className="p-2 bg-gray-100 rounded-md hover:bg-gray-200 cursor-pointer"
            >
              {item}
            </li>
          ))
        ) : query ? (
          <li className="text-gray-500">No results found</li>
        ) : null}
      </ul>
    </div>
  );
};

export default Search;
