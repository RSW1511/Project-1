let highestZ = 1;
let papersInteracted = 0;
const totalPapersToInteract = 6; // Adjust this number based on how many papers need to be dragged before proposal
let isMusicPlaying = false;

// Music control functionality
document.addEventListener('DOMContentLoaded', () => {
  const backgroundMusic = document.getElementById('background-music');
  const musicToggle = document.getElementById('music-toggle');
  
  // Set initial volume (can be adjusted as needed)
  backgroundMusic.volume = 0.7;
  
  // Function to forcefully try to play music
  const forcePlayMusic = () => {
    // Try to play music
    backgroundMusic.play()
      .then(() => {
        // Playback started successfully
        musicToggle.textContent = '🔊';
        isMusicPlaying = true;
      })
      .catch(error => {
        // Auto-play was prevented
        console.log("Autoplay prevented, will retry on interaction: ", error);
      });
  };
  
  // Try to play immediately
  forcePlayMusic();
  
  // Setup event listeners to try playing on any user interaction
  const startMusicOnInteraction = () => {
    if (!isMusicPlaying) {
      forcePlayMusic();
    }
  };
  
  // Try to play music on various user interactions
  document.addEventListener('click', startMusicOnInteraction, { once: false });
  document.addEventListener('touchstart', startMusicOnInteraction, { once: false });
  document.addEventListener('keydown', startMusicOnInteraction, { once: false });
  document.addEventListener('scroll', startMusicOnInteraction, { once: false });
  
  // Add click event to music toggle button
  musicToggle.addEventListener('click', () => {
    if (isMusicPlaying) {
      backgroundMusic.pause();
      musicToggle.textContent = '🔇';
      isMusicPlaying = false;
    } else {
      backgroundMusic.play()
        .then(() => {
          musicToggle.textContent = '🔊';
          isMusicPlaying = true;
        });
    }
  });
});

class Paper {
  holdingPaper = false;
  mouseTouchX = 0;
  mouseTouchY = 0;
  mouseX = 0;
  mouseY = 0;
  prevMouseX = 0;
  prevMouseY = 0;
  velX = 0;
  velY = 0;
  rotation = Math.random() * 30 - 15;
  currentPaperX = 0;
  currentPaperY = 0;
  rotating = false;

  init(paper) {
    document.addEventListener('mousemove', (e) => {
      if(!this.rotating) {
        this.mouseX = e.clientX;
        this.mouseY = e.clientY;
        
        this.velX = this.mouseX - this.prevMouseX;
        this.velY = this.mouseY - this.prevMouseY;
      }
        
      const dirX = e.clientX - this.mouseTouchX;
      const dirY = e.clientY - this.mouseTouchY;
      const dirLength = Math.sqrt(dirX*dirX+dirY*dirY);
      const dirNormalizedX = dirX / dirLength;
      const dirNormalizedY = dirY / dirLength;

      const angle = Math.atan2(dirNormalizedY, dirNormalizedX);
      let degrees = 180 * angle / Math.PI;
      degrees = (360 + Math.round(degrees)) % 360;
      if(this.rotating) {
        this.rotation = degrees;
      }

      if(this.holdingPaper) {
        if(!this.rotating) {
          this.currentPaperX += this.velX;
          this.currentPaperY += this.velY;
        }
        this.prevMouseX = this.mouseX;
        this.prevMouseY = this.mouseY;

        paper.style.transform = `translateX(${this.currentPaperX}px) translateY(${this.currentPaperY}px) rotateZ(${this.rotation}deg)`;
      }
    })

    paper.addEventListener('mousedown', (e) => {
      if(this.holdingPaper) return; 
      this.holdingPaper = true;
      
      paper.style.zIndex = highestZ;
      highestZ += 1;
      
      if(e.button === 0) {
        this.mouseTouchX = this.mouseX;
        this.mouseTouchY = this.mouseY;
        this.prevMouseX = this.mouseX;
        this.prevMouseY = this.mouseY;
      }
      if(e.button === 2) {
        this.rotating = true;
      }
      
      // Track interaction with papers
      if(!paper.classList.contains('proposal') && !paper.dataset.interacted) {
        paper.dataset.interacted = 'true';
        papersInteracted++;
        checkShowProposal();
      }
    });
    
    window.addEventListener('mouseup', () => {
      this.holdingPaper = false;
      this.rotating = false;
    });
  }
}

// Function to check if we should show the proposal
function checkShowProposal() {
  if(papersInteracted >= totalPapersToInteract) {
    const proposalPaper = document.getElementById('proposal-paper');
    if(proposalPaper) {
      proposalPaper.style.display = 'block';
      proposalPaper.style.zIndex = highestZ + 1;
      
      // Optional: Add animation
      proposalPaper.style.opacity = '0';
      proposalPaper.style.transform = 'translate(-50%, -50%) scale(0.8) rotateZ(0deg)';
      proposalPaper.style.top = '50%';
      proposalPaper.style.left = '50%';
      proposalPaper.style.position = 'fixed';
      
      setTimeout(() => {
        proposalPaper.style.transition = 'all 0.5s ease';
        proposalPaper.style.opacity = '1';
        proposalPaper.style.transform = 'translate(-50%, -50%) scale(1) rotateZ(0deg)';
      }, 100);
    }
  }
}

const papers = Array.from(document.querySelectorAll('.paper:not(.proposal)'));

papers.forEach(paper => {
  const p = new Paper();
  p.init(paper);
});

// Initially hide the proposal paper
document.addEventListener('DOMContentLoaded', () => {
  const proposalPaper = document.getElementById('proposal-paper');
  if(proposalPaper) {
    proposalPaper.style.display = 'none';
  }
});

// Mobile touch support
class TouchPaper {
  holdingPaper = false;
  touchStartX = 0;
  touchStartY = 0;
  touchMoveX = 0;
  touchMoveY = 0;
  touchEndX = 0;
  touchEndY = 0;
  prevTouchX = 0;
  prevTouchY = 0;
  velX = 0;
  velY = 0;
  rotation = Math.random() * 30 - 15;
  currentPaperX = 0;
  currentPaperY = 0;
  rotating = false;

  init(paper) {
    paper.addEventListener('touchmove', (e) => {
      e.preventDefault();
      if(!this.rotating) {
        this.touchMoveX = e.touches[0].clientX;
        this.touchMoveY = e.touches[0].clientY;
        
        this.velX = this.touchMoveX - this.prevTouchX;
        this.velY = this.touchMoveY - this.prevTouchY;
      }
        
      const dirX = e.touches[0].clientX - this.touchStartX;
      const dirY = e.touches[0].clientY - this.touchStartY;
      const dirLength = Math.sqrt(dirX*dirX+dirY*dirY);
      const dirNormalizedX = dirX / dirLength;
      const dirNormalizedY = dirY / dirLength;

      const angle = Math.atan2(dirNormalizedY, dirNormalizedX);
      let degrees = 180 * angle / Math.PI;
      degrees = (360 + Math.round(degrees)) % 360;
      if(this.rotating) {
        this.rotation = degrees;
      }

      if(this.holdingPaper) {
        if(!this.rotating) {
          this.currentPaperX += this.velX;
          this.currentPaperY += this.velY;
        }
        this.prevTouchX = this.touchMoveX;
        this.prevTouchY = this.touchMoveY;

        paper.style.transform = `translateX(${this.currentPaperX}px) translateY(${this.currentPaperY}px) rotateZ(${this.rotation}deg)`;
      }
    })

    paper.addEventListener('touchstart', (e) => {
      if(this.holdingPaper) return; 
      this.holdingPaper = true;
      
      paper.style.zIndex = highestZ;
      highestZ += 1;
      
      this.touchStartX = e.touches[0].clientX;
      this.touchStartY = e.touches[0].clientY;
      this.prevTouchX = this.touchStartX;
      this.prevTouchY = this.touchStartY;
      
      // Track interaction with papers for touch devices too
      if(!paper.classList.contains('proposal') && !paper.dataset.interacted) {
        paper.dataset.interacted = 'true';
        papersInteracted++;
        checkShowProposal();
      }
    });
    
    paper.addEventListener('touchend', () => {
      this.holdingPaper = false;
      this.rotating = false;
    });

    // For two-finger rotation on touch screens
    paper.addEventListener('gesturestart', (e) => {
      e.preventDefault();
      this.rotating = true;
    });
    paper.addEventListener('gestureend', () => {
      this.rotating = false;
    });
  }
}

// Apply touch events as well
papers.forEach(paper => {
  const tp = new TouchPaper();
  tp.init(paper);
});

// Proposal functionality
document.addEventListener('DOMContentLoaded', () => {
  const yesButton = document.getElementById('yesButton');
  const noButton = document.getElementById('noButton');
  const successMessage = document.getElementById('success-message');
  const backgroundMusic = document.getElementById('background-music');
  
  // Make the No button avoid the mouse
  noButton.addEventListener('mouseover', (e) => {
    const x = Math.random() * 200 - 100;
    const y = Math.random() * 200 - 100;
    
    // Ensure the button stays within viewport
    const buttonRect = noButton.getBoundingClientRect();
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    let newX = x;
    let newY = y;
    
    if (buttonRect.right + x > windowWidth) newX = -Math.abs(x);
    if (buttonRect.left + x < 0) newX = Math.abs(x);
    if (buttonRect.bottom + y > windowHeight) newY = -Math.abs(y);
    if (buttonRect.top + y < 0) newY = Math.abs(y);
      
    noButton.style.transform = `translate(${newX}px, ${newY}px)`;
  });
  
  // When Yes button is clicked
  yesButton.addEventListener('click', () => {
    // Make sure music is playing for this special moment
    if (!isMusicPlaying && backgroundMusic) {
      backgroundMusic.play()
        .then(() => {
          isMusicPlaying = true;
          document.getElementById('music-toggle').textContent = '🔊';
        })
        .catch(err => console.log("Can't play audio on yes click: ", err));
    }
    
    // Create confetti explosion
    const confettiCanvas = document.getElementById('confetti-canvas');
    const myConfetti = confetti.create(confettiCanvas, {
      resize: true
    });
    
    // Confetti explosion
    myConfetti({
      particleCount: 150,
      spread: 160,
      origin: { y: 0.6 }
    });
    
    // Multiple confetti bursts
    setTimeout(() => {
      myConfetti({
        particleCount: 100,
        angle: 60,
        spread: 55,
        origin: { x: 0 }
      });
    }, 250);
    
    setTimeout(() => {
      myConfetti({
        particleCount: 100,
        angle: 120,
        spread: 55,
        origin: { x: 1 }
      });
    }, 400);
    
    // Show success message
    successMessage.style.display = 'block';
    
    // Hide all papers
    papers.forEach(paper => {
      if (!paper.classList.contains('proposal')) {
        paper.style.opacity = '0.2';
        paper.style.pointerEvents = 'none';
      }
    });
    
    // Make proposal paper center of attention
    const proposalPaper = document.querySelector('.paper.proposal');
    proposalPaper.style.zIndex = highestZ + 1;
    proposalPaper.style.transform = 'translate(-50%, -50%) scale(1.2) rotateZ(0deg)';
    proposalPaper.style.top = '50%';
    proposalPaper.style.left = '50%';
    proposalPaper.style.position = 'fixed';
    
    // Hide the No button
    noButton.style.display = 'none';
    
    // Change Yes button
    yesButton.textContent = '❤️ Yes! ❤️';
    yesButton.style.transform = 'scale(1.2)';
    yesButton.style.backgroundColor = 'rgba(255, 100, 100, 0.9)';
  });
  
  // For touch devices - make No button move away on touch
  noButton.addEventListener('touchstart', (e) => {
    e.preventDefault();
    
    const x = Math.random() * 200 - 100;
    const y = Math.random() * 200 - 100;
    
    // Ensure the button stays within viewport
    const buttonRect = noButton.getBoundingClientRect();
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    let newX = x;
    let newY = y;
    
    if (buttonRect.right + x > windowWidth) newX = -Math.abs(x);
    if (buttonRect.left + x < 0) newX = Math.abs(x);
    if (buttonRect.bottom + y > windowHeight) newY = -Math.abs(y);
    if (buttonRect.top + y < 0) newY = Math.abs(y);
    
    noButton.style.transform = `translate(${newX}px, ${newY}px)`;
  });
});