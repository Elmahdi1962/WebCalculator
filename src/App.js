import './App.css';
import { useState, useEffect } from 'react';

function App() {
  const [originalSizes, setOriginalSizes] = useState({});
  const [reducedImagesSize, setReducedImagesSize] = useState(0);
  const [finishedReducing, setFinishedReducing] = useState(false);
  const [startReducing, setStartReducing] = useState(false);

  const [pageSize, setPageSize] = useState(0);
  const [reduceVideos, setReduceVideos] = useState(false);
  const [reduceDarkmode, setReduceDarkmode] = useState(false);

  const [reducedPageSize, setReducedPageSize] = useState(0);
  const [reducedPercentage, setReducedPercentage] = useState(0);

  function draw(img, type) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext("2d");
    document.body.appendChild(canvas);
  
    // the img refers to the image
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    
    // filter
    ctx.filter = 'contrast(100%) grayscale(20%) opacity(90%) saturate(70%) brightness(100%)';
    ctx.drawImage(img, 0, 0);
    img.src = canvas.toDataURL(type);
    document.body.removeChild(canvas);
  };

  const reduceImage = async (file) => {
    //save file name and its size
    setOriginalSizes(prevstate => ({...prevstate, [file.name]: file.size}));
    // read file in put it in a image tag
    const fr = new FileReader();
    const img = new Image();
    img.crossOrigin = '';
    img.id = file.name;
    document.body.appendChild(img);

    await new Promise((resolve) => {
      fr.onload = function () {
        img.src = fr.result || 'none';
        resolve();
      }
      fr.readAsDataURL(file)
    });

    // draw the image in canvas and apply filters to it
    draw(img, file.type);
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    setStartReducing(false);
    setFinishedReducing(false);
    setOriginalSizes({});
    setReducedImagesSize(0);
    setPageSize(e.target.elements.pageSize.value);
    setReduceDarkmode(e.target.elements.reduceDarkmode.checked);
    setReduceVideos(e.target.elements.reduceVideos.checked);

    Array.from(e.target.elements.folder.files).forEach(reduceImage);

    setStartReducing(true);
  };

  useEffect(() => {
    if(startReducing) {
      // get new sizes of imgs and calculate the total reduced amount of bytes
      const imgs = document.getElementsByTagName('img');
      Array.from(imgs).forEach(img => {
        fetch(img.src).then(resp => resp.blob())
        .then(blob => {
          const newSize = blob.size;
          const oldSize = originalSizes[img.id];
          setReducedImagesSize(prevVal => prevVal + (oldSize - newSize));
          img.remove();
        });
      });
      
      // Finish Calculations
      const before = pageSize;
      const imagesReduced = reducedImagesSize;
      const reduceVid = reduceVideos;
      const reduceDM = reduceDarkmode;

      let after = before;
      let howMuchToReduce = 100; // 100% means reduce 0%

      // reduce images
      after = after - imagesReduced;
      // reduce 10% darkmode if checked
      if (reduceDM) {
        howMuchToReduce -= 10;
      }
      // reduce 5% of videos if checked
      if (reduceVid) {
        howMuchToReduce -= 5;
      }
      // reduce what is checked
      after = (after * howMuchToReduce) / 100;
      setReducedPageSize(after);
      setReducedPercentage(howMuchToReduce);

      // calculations finished
      setFinishedReducing(true);
    }
  }, [originalSizes, startReducing, pageSize, reduceDarkmode, reduceVideos, reducedImagesSize]);

  return (
    <div className="App">
      <form onSubmit={submitHandler}>
        <div>
          <label htmlFor='pageSize'>Page Size in Bytes :</label>
          <input type='number' id='pageSize' />
        </div>
        <div>
          <label htmlFor='reduceVideos'>Reduce Videos ? :</label>
          <input type='checkbox' id='reduceVideos'/>
        </div>
        <div>
          <label htmlFor='reduceDarkmode'>Reduce DarkMode ? :</label>
          <input type='checkbox' id='reduceDarkmode' />
        </div>
        <div>
          <label htmlFor='folder-picker'>Choose images to reduce : </label>
          <input type="file" name='folder' id='folder-picker' webkitdirectory='true' directory='true' multiple />
        </div>
        
        <input type='submit' value='Reduce' />
      </form>

      {
        finishedReducing ?
        <div id='results_div'>
          <h4>Total reduced from all images is : {reducedImagesSize} Bytes</h4>
          <h4>Reduced for {reduceDarkmode && 'DarkMode 10%'} {reduceDarkmode && reduceVideos && 'and'} {reduceVideos && 'Videos 5%'} with Total reduced: -{100 - reducedPercentage}%</h4>
          <h4>Reduced Page Size (After) : {reducedPageSize} Bytes || -{((pageSize - reducedPageSize) * 100) / pageSize}%</h4>
        </div>
        :
        <></>
      }
    </div>
  );
}

export default App;
