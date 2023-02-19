import { useState, useEffect } from "react";
import { RiArrowDownSLine } from "react-icons/ri";

export default function AccordionComponent({ items }) {
  // const [activeIndex, setActiveIndex] = useState(null);

  // function toggleActive(index) {
  //   setActiveIndex(activeIndex === index ? null : index);
  // }
  console.log("papers", items)
  const [activeIndexes, setActiveIndexes] = useState([]);
  function toggleActive(index) {
    if (activeIndexes.includes(index)) {
      setActiveIndexes(activeIndexes.filter(i => i !== index));
    } else {
      setActiveIndexes([...activeIndexes, index]);
    }
  }

  // useEffect(() => {
  //   setFileData(JSON.parse(papers));
  // }, [papers]);

  return (
    <div>
      {items.map((paper, index) => (
        <div
          key={index}
          className={`accordion-item ${activeIndexes.includes(index) ? 'active' : ''}`}
          onClick={() => toggleActive(index)}
        >
          <div
            className={`accordion ${
              activeIndexes.includes(index) ? "active" : ""
            } d-flex align-items-center`}
          >
            <div className="accordion-arrow">
              <RiArrowDownSLine size={32} />
            </div>
            <div className="accordion-title">{paper.paperName}</div>
            
          </div>
          <div className="accordion-content"> Version: {paper.version}</div>
          <div className="accordion-content">Date Submitted: {paper.dateSubmitted}</div>
          {/* <div className="accordion-content">{paper.paperAuthors}</div> */}
          {/* <div className="accordion-content">{paper.paperStatus}</div> */}
        </div>
      ))}
    </div> 
  );
}
