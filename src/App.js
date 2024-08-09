
import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { FaPlay, FaPause, FaStepBackward, FaStepForward, FaVolumeUp, FaVolumeMute } from 'react-icons/fa';
import { HiOutlineDotsHorizontal } from 'react-icons/hi';
import './App.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { MdMenu } from 'react-icons/md'; // Import the menu icon
import { IoMdCloseCircle } from "react-icons/io";

const App = () => {
  const [musicData, setMusicData] = useState([]);
  const [currentSong, setCurrentSong] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredMusicData, setFilteredMusicData] = useState([]);
  const [topTracks, setTopTracks] = useState([]);
  const [activeTab, setActiveTab] = useState('For You');
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isCardVisible, setIsCardVisible] = useState(false); // State for card visibility

  const audioRef = useRef(null);

  const [searchBarStyle, setSearchBarStyle] = useState({});
  const [activeItemStyle, setActiveItemStyle] = useState({});
  const [activeColor, setActiveColor] = useState('#000'); // Default color

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Simulate a delay for spinner
        await new Promise(resolve => setTimeout(resolve, 5000));

        const response = await axios.get('https://cms.samespace.com/items/songs');
        const data = response.data.data;
        setMusicData(data);
        setTopTracks(data.filter(song => song.top_track)); // Set top tracks based on API
        setCurrentSong(data[0]);
        setLoading(false); // Set loading to false after data is fetched
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false); // Set loading to false on error
      }
    };

    fetchData();
    
  }, []);

  useEffect(() => {
    const filteredData = musicData.filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.artist.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredMusicData(filteredData);
  }, [searchTerm, musicData]);

  useEffect(() => {
    const updateProgress = () => {
      if (audioRef.current) {
        const duration = audioRef.current.duration;
        const currentTime = audioRef.current.currentTime;
        setProgress((currentTime / duration) * 100);
      }
    };

    if (audioRef.current) {
      audioRef.current.addEventListener('timeupdate', updateProgress);
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener('timeupdate', updateProgress);
      }
    };
  }, [currentSong]);

  useEffect(() => {
    if (currentSong) {
      const accentColor = currentSong.accent;
      setActiveColor(accentColor);
      setSearchBarStyle({ backgroundColor: accentColor, borderColor: accentColor });
      setActiveItemStyle({ backgroundColor: accentColor, color: '#fff' });

      document.documentElement.style.setProperty('--accent-color', accentColor);
    }
  }, [currentSong]);

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });
  };

  const handlePrevSong = () => {
    const currentIndex = musicData.findIndex((song) => song.id === currentSong.id);
    if (currentIndex > 0) {
      setCurrentSong(musicData[currentIndex - 1]);
    }
  };

  const handleNextSong = () => {
    const currentIndex = musicData.findIndex((song) => song.id === currentSong.id);
    if (currentIndex < musicData.length - 1) {
      setCurrentSong(musicData[currentIndex + 1]);
    }
  };

  const handleSendToTopTrack = () => {
    if (currentSong) {
      if (topTracks.includes(currentSong)) {
        setTopTracks(topTracks.filter(track => track.id !== currentSong.id));
        toast.info('Song removed from Top Tracks!');
      } else {
        setTopTracks([...topTracks, currentSong]);
        toast.success('Song added to Top Tracks!');
      }
    }
  };

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !audioRef.current.muted;
      setIsMuted(audioRef.current.muted);
    }
  };

  const handleProgressClick = (event) => {
    const progressBar = event.currentTarget;
    const offsetX = event.nativeEvent.offsetX;
    const progressBarWidth = progressBar.clientWidth;
    const newTime = (offsetX / progressBarWidth) * audioRef.current.duration;
    audioRef.current.currentTime = newTime;
  };

  const subheadingStyle = activeTab === 'Top Tracks' ? { flexDirection: 'row' } : { flexDirection: 'row-reverse' };

  return (
    <div 
      className="app-container" 
      style={{ 
        height: '110vh',
        width:'fit-content',
        background: loading ? '#ecf9ea' : (currentSong ? `linear-gradient(to right, ${currentSong.accent}, #000)` : 'linear-gradient(to right, #1F1507, #1B1205, #080602)'),
      }}
    >
      <ToastContainer />
      {loading && (
        <div className="spinner" >
          <div></div>
          <div></div>
          <div></div>
        </div>
      )}
      <div className={`spotify-logo ${loading ? 'loading' : ''}`}>
        <img src="https://upload.wikimedia.org/wikipedia/commons/2/26/Spotify_logo_with_text.svg" alt="Spotify" />

          {!loading && (
    <button className='menu-btn' onClick={() => setIsCardVisible(!isCardVisible)}> 
      <MdMenu className='menu' />
    </button>
  )}

      </div>

      {!loading && (
        <div className="sidebar">
          <div className="navigation">
            <div className={`nav-item ${activeTab === 'For You' ? 'active' : ''}`} onClick={() => setActiveTab('For You')}>For You</div>
            <div className={`nav-item ${activeTab === 'Top Tracks' ? 'active' : ''}`} onClick={() => setActiveTab('Top Tracks')}>Top Tracks</div>
          </div>
          <div className="search-bar-container">
            <input
              type="text"
              className="search-bar"
              style={searchBarStyle}
              placeholder="Search Song, Artist"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg className="search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
        
          <ul className="music-list">
            {(activeTab === 'For You' ? filteredMusicData : topTracks).length > 0 ? (
              (activeTab === 'For You' ? filteredMusicData : topTracks).map((item) => (
                <li
                  key={item.id}
                  className={`music-item ${currentSong && currentSong.id === item.id ? 'active' : ''}`}
                  style={currentSong && currentSong.id === item.id ? activeItemStyle : {}}
                  onClick={() => setCurrentSong(item)}
                >
                  <div>
                    <img src={`https://cms.samespace.com/assets/${item.cover}`} alt={item.name} className="thumbnail" />
                  </div>
                  <div className="music-info">
                    <div>
                      <h2>{item.name}</h2>
                      <p>{item.artist}</p>
                    </div>
                    <div>
                      <p>{formatTime(item.date_updated)}</p>

                    </div>
                  </div>
                </li>
              ))
            ) : (
              <div className="empty-state">No songs available</div>
            )}
          </ul>
        </div>
      )}

  <div className="player">
       {currentSong && (
          <>
            <div className='subheading' style={subheadingStyle}>
              {activeTab !== 'Top Tracks' && (
                <button className="send-to-top-track" onClick={handleSendToTopTrack}>
                  {topTracks.includes(currentSong) ? 'Add from Top Track' : 'Remove to Top Track'}
                </button>
              )}
              <div className="cont">
                <div className="song-name">{currentSong.name}</div>
                <p className="song-title">{currentSong.artist}</p>
              </div>
            </div>
            <img src={`https://cms.samespace.com/assets/${currentSong.cover}`} alt={currentSong.name} className="current-thumbnail" />
         
                        <div className="progress-container" onClick={handleProgressClick}>
              <div className="progress-bar" style={{ width: `${progress}%` }}></div>
            </div>
            <div className='controls-container'>
              <div className='menu-dots'>
                <HiOutlineDotsHorizontal className="control-button"/>
              </div>
              <div className='icons'>
                <FaStepBackward onClick={handlePrevSong} className="control-button" />
                {isPlaying ? (
                  <FaPause onClick={togglePlayPause} className="play-button" />
                ) : (
                  <FaPlay onClick={togglePlayPause} className="pause-button" />
                )}
                <FaStepForward onClick={handleNextSong} className="control-button" />
              </div>
              <div className="volume-control">
                {isMuted ? (
                  <FaVolumeMute onClick={toggleMute} className="volume-button" />
                ) : (
                  <FaVolumeUp onClick={toggleMute} className="volume-button" />
                )}
              </div>
            </div>
            <audio ref={audioRef} src={currentSong.url} />
          </>
        )}
      </div>
      {isCardVisible && (
        <div className="card">
                        <div className='nav-items'>

            <div className="navigation">
            <div className={`nav-item ${activeTab === 'For You' ? 'active' : ''}`} onClick={() => setActiveTab('For You')}>For You</div>
            <div className={`nav-item ${activeTab === 'Top Tracks' ? 'active' : ''}`} onClick={() => setActiveTab('Top Tracks')}>Top Tracks</div>
            </div>
            <div className='remove'>
            <IoMdCloseCircle className='remove-icon'/>

</div>

          </div>
                     <ul className="music-list">
           {(activeTab === 'For You' ? filteredMusicData : topTracks).length > 0 ? (
              (activeTab === 'For You' ? filteredMusicData : topTracks).map((item) => (
                <li
                  key={item.id}
                  className={`music-item ${currentSong && currentSong.id === item.id ? 'active' : ''}`}
                  style={currentSong && currentSong.id === item.id ? activeItemStyle : {}}
                  onClick={() => setCurrentSong(item)}
                >
                  <div>
                    <img src={`https://cms.samespace.com/assets/${item.cover}`} alt={item.name} className="thumbnail" />
                  </div>
                  <div className="music-info">
                    <div>
                      <h2>{item.name}</h2>
                      <p>{item.artist}</p>
                    </div>
                    <div>
                    <p>{formatTime(item.date_updated)}</p>
                    </div>
                  </div>
                </li>
              ))
            ) : (
              <li className="no-data">No songs available</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default App;
