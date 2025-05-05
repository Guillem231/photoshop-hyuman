import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Line, Text, Image } from 'react-konva';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaintBrush, faEraser, faImage, faTrash, faSave, faEye } from '@fortawesome/free-solid-svg-icons';import './App.css';
import './fonts.css';
import Konva from 'konva';

function App() {
  const [tool, setTool] = useState('brush');
  const [lines, setLines] = useState([]);
  const [color, setColor] = useState('#FFFFFF');
  const [brushSize, setBrushSize] = useState(5);
  const isDrawing = useRef(false);
  const stageRef = useRef(null);
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
  const containerRef = useRef(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [imageScale, setImageScale] = useState(1);
  const fileInputRef = useRef(null);
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [showAlert, setShowAlert] = useState(true);


  const colors = ['#000000', '#FFFFFF', '#757963', '#FF0000', '#0000FF', '#FFFF00'];
  const brushSizes = [2, 5, 10, 20, 30];

  useEffect(() => {
    // Mostrar alerta cada vez que se carga la aplicación
    setShowAlert(true);
    
    // Cerrar automáticamente después de 5 segundos
    const timer = setTimeout(() => {
      setShowAlert(false);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Mostrar alerta al cargar la página
    showNativeAlert();
    
    // Mostrar alerta cuando el usuario regresa a la pestaña
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        showNativeAlert();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const showNativeAlert = () => {
    // Intentar usar notificaciones nativas primero
    if ("Notification" in window) {
      if (Notification.permission === "granted") {
        showNotification();
      } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then(permission => {
          if (permission === "granted") {
            showNotification();
          } else {
            // Fallback a alerta del navegador
            showBrowserAlert();
          }
        });
      } else {
        // Fallback a alerta del navegador
        showBrowserAlert();
      }
    } else {
      // Notificaciones no soportadas, usar alerta del navegador
      showBrowserAlert();
    }
  };

  const showNotification = () => {
    const notification = new Notification("BUILDING HYUMAN", {
      body: "This experience is currently in development. Create your own designs and express yourself. #WearYourBeliefs",
      icon: "/logo192.png" // Asegúrate de tener este archivo en tu carpeta public
    });
    
    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  };

  const showBrowserAlert = () => {
    setTimeout(() => {
      window.confirm("🚧 BUILDING HYUMAN 🚧\n\nThis experience is currently in development. Create your own designs and express yourself.\n\n#WearYourBeliefs");
    }, 500);
  };

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        const height = containerRef.current.offsetHeight;
        setStageSize({ width, height });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const handleMouseDown = (e) => {
    if (tool === 'brush' || tool === 'eraser') {
      isDrawing.current = true;
      const pos = e.target.getStage().getPointerPosition();
      setLines([...lines, { 
        tool, 
        points: [pos.x, pos.y], 
        color: tool === 'eraser' ? '#1e1e1e' : color,
        brushSize: tool === 'eraser' ? brushSize * 2 : brushSize
      }]);
    }
  };

  const handleMouseMove = (e) => {
    if (!isDrawing.current) {
      return;
    }
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    let lastLine = lines[lines.length - 1];
    
    // Add point to the last line
    lastLine.points = lastLine.points.concat([point.x, point.y]);
    
    // Replace the last line
    lines.splice(lines.length - 1, 1, lastLine);
    setLines([...lines]);
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
  };

  const clearCanvas = () => {
    setLines([]);
    setUploadedImage(null);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new window.Image();
        img.src = reader.result;
        img.onload = () => {
          // Calculate scale to fit the image within the canvas
          const scale = Math.min(
            stageSize.width / img.width,
            stageSize.height / img.height
          ) * 0.8;
          
          setUploadedImage(img);
          setImageScale(scale);
          setImagePosition({
            x: (stageSize.width - img.width * scale) / 2,
            y: (stageSize.height - img.height * scale) / 2
          });
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const downloadImage = () => {
    const dataURL = stageRef.current.toDataURL();
    const link = document.createElement('a');
    link.download = 'hyuman-design.png';
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="photoshop-app">
      <div className="photoshop-menubar">
        <div className="ps-logo">YA</div>
        <div className="menu-items">
          <span>File</span>
          <span>Edit</span>
          <span>Image</span>
          <span>Layer</span>
          <span>Type</span>
          <span>Select</span>
          <span>Filter</span>
          <span>3D</span>
          <span>View</span>
          <span>Window</span>
          <span>Help</span>
        </div>
      </div>
      
      <div className="photoshop-workspace">
        <div className="tools-panel">
          <div className={`tool-item ${tool === 'brush' ? 'active' : ''}`} onClick={() => setTool('brush')}>
            <FontAwesomeIcon icon={faPaintBrush} className="tool-icon" />
            <span className="tool-tooltip">Brush</span>
          </div>
          <div className={`tool-item ${tool === 'eraser' ? 'active' : ''}`} onClick={() => setTool('eraser')}>
            <FontAwesomeIcon icon={faEraser} className="tool-icon" />
            <span className="tool-tooltip">Eraser</span>
          </div>
          <div className="tool-item" onClick={triggerFileInput}>
            <FontAwesomeIcon icon={faImage} className="tool-icon" />
            <span className="tool-tooltip">Import Image</span>
          </div>
          <div className="tool-item" onClick={clearCanvas}>
            <FontAwesomeIcon icon={faTrash} className="tool-icon" />
            <span className="tool-tooltip">Clear</span>
          </div>
          <div className="tool-item" onClick={downloadImage}>
            <FontAwesomeIcon icon={faSave} className="tool-icon" />
            <span className="tool-tooltip">Save</span>
          </div>
          <div className="tool-separator"></div>
          {colors.map((c) => (
            <div 
              key={c} 
              className={`color-tool ${color === c ? 'active' : ''}`} 
              style={{ backgroundColor: c }}
              onClick={() => {setColor(c); setTool('brush');}}
            ></div>
          ))}
          <div className="tool-separator"></div>
          {brushSizes.map((size) => (
            <div 
              key={size} 
              className={`brush-size-tool ${brushSize === size ? 'active' : ''}`} 
              onClick={() => setBrushSize(size)}
            >
              <div 
                className="brush-size-indicator" 
                style={{ width: size, height: size }}
              ></div>
            </div>
          ))}
        </div>
        
        <div className="document-area">
          <div className="document-tab">
            <span>HYUMAN.psd @ 100%</span>
            <span className="close-tab">×</span>
          </div>
          
          <div className="canvas-container" ref={containerRef}>
            <Stage
              width={stageSize.width}
              height={stageSize.height}
              onMouseDown={handleMouseDown}
              onMousemove={handleMouseMove}
              onMouseup={handleMouseUp}
              onTouchStart={handleMouseDown}
              onTouchMove={handleMouseMove}
              onTouchEnd={handleMouseUp}
              ref={stageRef}
            >
              <Layer>
                {/* Grid lines */}
                <Line
                  points={[0, stageSize.height/2, stageSize.width, stageSize.height/2]}
                  stroke="#333333"
                  strokeWidth={1}
                  dash={[10, 5]}
                />
                <Line
                  points={[stageSize.width/2, 0, stageSize.width/2, stageSize.height]}
                  stroke="#333333"
                  strokeWidth={1}
                  dash={[10, 5]}
                />
                
               
                
                {/* HYUMAN Text */}
                <Text
                  text="HYUMAN"
                  fontSize={Math.max(50, stageSize.width * 0.10)} // Mínimo 14px
                  fontFamily="AtariKids"
                  fill="#00000"
                  opacity={0.9}
                  x={stageSize.width/2}
                  y={stageSize.height/2 - stageSize.width * 0.12}
                  align="center"
                  width={stageSize.width}
                  offsetX={stageSize.width/2}
                />
                 {/* BUILDING Text */}

                
                {/* Slogan Text */}
                <Text
                  text="wear your beliefs"
                  fontSize={Math.max(17, stageSize.width * 0.03)} // Mínimo 14px
                  fontFamily="AtariKids"
                  fill="#00000"
                  opacity={0.9}
                  x={stageSize.width/2}
                  y={stageSize.height/2 + stageSize.width * 0.02}
                  align="center"
                  width={stageSize.width}
                  offsetX={stageSize.width/2}
                />
                
                {/* Uploaded Image */}
                {uploadedImage && (
                  <Image
                    image={uploadedImage}
                    x={imagePosition.x}
                    y={imagePosition.y}
                    width={uploadedImage.width * imageScale}
                    height={uploadedImage.height * imageScale}
                    draggable
                    onDragEnd={(e) => {
                      setImagePosition({
                        x: e.target.x(),
                        y: e.target.y()
                      });
                    }}
                  />
                )}
                
                {/* User drawing lines */}
                {lines.map((line, i) => (
                  <Line
                    key={i}
                    points={line.points}


                    stroke={line.color}
                    strokeWidth={line.brushSize}
                    tension={0.5}
                    lineCap="round"
                    lineJoin="round"
                    globalCompositeOperation={
                      line.tool === 'eraser' ? 'destination-out' : 'source-over'
                    }
                  />
                ))}
              </Layer>
            </Stage>
          </div>
        </div>
        
        <div className="panels-area">
          <div className="panel">
            <div className="panel-header">Layers</div>
            <div className="panel-content">
              <div className="layer-item active">
                <span className="layer-visibility">
                  <FontAwesomeIcon icon={faEye} />
                </span>
                <span className="layer-name">Voices in Fabric</span>
              </div>
              <div className="layer-item">
                <span className="layer-visibility">
                  <FontAwesomeIcon icon={faEye} />
                </span>
                <span className="layer-name">HYUMAN</span>
              </div>
              <div className="layer-item">
                <span className="layer-visibility">
                  <FontAwesomeIcon icon={faEye} />
                </span>
                <span className="layer-name">Designed to Disrupt</span>
              </div>
            </div>
          </div>
          
          <div className="panel">
            <div className="panel-header">Properties</div>
            <div className="panel-content">
              <div className="property-row">


                <span>Brush Size:</span>
                <span>{brushSize}px</span>
              </div>
              <div className="property-row">


                <span>Color:</span>
                <span className="color-preview" style={{backgroundColor: color}}></span>
              </div>
              <div className="property-row">
                <span>Tool:</span>
                <span>{tool.charAt(0).toUpperCase() + tool.slice(1)}</span>
              </div>
              
              <div className="property-separator"></div>
              
              <div className="property-row">
                <span 
                  className="filter-toggle" 
                  onClick={() => setShowFilters(!showFilters)}
                >
                  {showFilters ? '▼ Hide Filters' : '► Show Filters'}
                </span>
              </div>
              
              {showFilters && (
                <>
                  <div className="property-row">
                    <span>Brightness:</span>
                    <input 
                      type="range" 
                      min="-100" 
                      max="100" 
                      value={brightness} 
                      onChange={(e) => setBrightness(parseInt(e.target.value))} 
                      className="slider"
                    />
                  </div>
                  <div className="property-row">
                    <span>Contrast:</span>
                    <input 
                      type="range" 
                      min="-100" 
                      max="100" 
                      value={contrast} 
                      onChange={(e) => setContrast(parseInt(e.target.value))} 
                      className="slider"
                    />
                  </div>
                  <div className="property-row">
                    <button 
                      className="reset-button" 
                      onClick={() => {
                        setBrightness(0);
                        setContrast(0);
                      }}
                    >
                      Reset Filters
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="status-bar">
        <div>100% ⟩</div>

        <div>Doc: {Math.round(stageSize.width)}px × {Math.round(stageSize.height)}px</div>
      </div>
      
      {/* Hidden file input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        accept="image/*" 
        onChange={handleImageUpload} 
      />
{showAlert && (
  <div className="native-alert-overlay" onClick={() => setShowAlert(false)}>
    <div className="native-alert" onClick={(e) => e.stopPropagation()}>
      <div className="native-alert-header">
        <div className="native-alert-icon">🚧</div>
        <div className="native-alert-title">BUILDING HYUMAN</div>
        <div className="native-alert-close" onClick={() => setShowAlert(false)}>×</div>
      </div>
      <div className="native-alert-body">
        <p>This experience is currently in development.</p>
        <p>Create your own designs and express yourself.</p>
      </div>
      <div className="native-alert-footer">
        <div className="native-alert-progress">
          <div className="native-alert-progress-bar"></div>
        </div>
        <button className="native-alert-button" onClick={() => setShowAlert(false)}>
          Got it
        </button>
      </div>
    </div>
  </div>
)}


    </div>
    
  );
  
}



export default App;
