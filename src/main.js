var app = app || {};
    
//iffe.
app.main = (function(){
    "use strict";
		
		window.onload = init;
		
		// SCRIPT SCOPED VARIABLES
				
		// 1- here we are faking an enumeration - we'll look at another way to do this soon 
		const SOUND_PATH = Object.freeze
		(
			{
				sound1: "media/Roaring Tides II.mp3",
				sound2: "media/we've never met.mp3",
				sound3:  "media/Soulful.mp3"
			}
		);
		
		// 2 - elements on the page
		let audioElement,canvasElement, ctxColor;
		
		//hill
		let image;
		image = new Image();
		image.src = "hill.png";

		//sun
		let sunImage;
		sunImage = new Image();
		sunImage.src = "sun.png";
		
		// UI
		let playButton;
		
		// canvas drawing context
		let drawCtx;
		
		// webAudio context
		let audioCtx;
		
		// WebAudio audio routing graph
		let sourceNode, analyserNode, gainNode, delayNode, maxRadius;
		let biquadFilter;
		let delayAmount;
		let audioType;
		let audioFilter;
		let bufferLength;
		let noFilterBool;
		
		// audio frequency data
		const NUM_SAMPLES = 256;

		// create a new array of 8-bit integers (0-255)
		let audioData = new Uint8Array(NUM_SAMPLES/2); 

		// pixel effect variables
		let showTint, showInvert, showNoise, showSepia = false; 
		let defaultBool; //reverse boolean for radio buttons and reversing visualizer's y axis.

		//sprite elements
		let direction = {x:1,y:0};
		let spriteImage; // sprite image
		spriteImage = new Image();
		spriteImage.src = "petal.png";
		let spriteArray; // for sprites

		//hue changes
		let color;
		
		//bar variables
		let barWidth, barSpacing, barHeight, topSpacing;

		// FUNCTIONS
		function init()
		{
			setupWebaudio();
			setupCanvas();
			setupUI();
			setupImage();
			// spriteArray = app.helper.createSprites(drawCtx, 32, spriteImage);
			update();

		}

        function setupWebaudio()
        {
			// 1 - The || is because WebAudio has not been standardized across browsers yet
			const AudioContext = window.AudioContext || window.webkitAudioContext;
			audioCtx = new AudioContext();
			delayAmount = 0.5;

			// 2 - get a reference to the <audio> element on the page
			if(audioType = "frequency")
			{
				audioElement = document.querySelector("audio");
				audioElement.src = SOUND_PATH.sound3;
			}

			//no idea why, but create biquad filter doesn't work so I can't create a filter for audio, tried for 2-3 hours but can't do it for some reason
			//I looked at week5a for help but the methods work there, but not here for some reason
			biquadFilter = new BiquadFilterNode(audioCtx);
			biquadFilter.type = "lowshelf";
			// biquadFilter.frequency.setValueAtTime(600, audioCtx.currentTime);
			// biquadFilter.gain.setValueAtTime(25, audioCtx.currentTime);

			// create an a source node that points at the <audio> element
			sourceNode = audioCtx.createMediaElementSource(audioElement);
			
			// create an analyser node
			analyserNode = audioCtx.createAnalyser();

			//waveform
			if(audioType = "waveform")
			{
				analyserNode.getByteTimeDomainData(audioData); 
				bufferLength = analyserNode.frequencyBinCount;
			}

			if(noFilterBool == true)
			{
				//vaporwave off
				app.helper.toggleLowshelf(audioCtx, biquadFilter, noFilterBool);
			}
			//waveform
			else if(noFilterBool == false)
			{
				//default = false, vaporwave effect
				app.helper.toggleLowshelf(audioCtx, biquadFilter, noFilterBool);
			}	
			/*
			We will request NUM_SAMPLES number of samples or "bins" spaced equally 
			across the sound spectrum.
			
			If NUM_SAMPLES (fftSize) is 256, then the first bin is 0 Hz, the second is 172 Hz, 
			the third is 344Hz. Each bin contains a number between 0-255 representing 
			the amplitude of that frequency.
			*/ 
			
			// fft stands for Fast Fourier Transform
			analyserNode.fftSize = NUM_SAMPLES;
			
			// gain (volume) node
			gainNode = audioCtx.createGain();
			gainNode.gain.value = 1;

			//delay node for vaporwave
			//delayNode = audioCtx.createDelay();
			//delayNode.delaytime.value = delayAmount;

			// connect the nodes
			sourceNode.connect(biquadFilter);
			biquadFilter.connect(analyserNode);
			analyserNode.connect(gainNode);
			gainNode.connect(audioCtx.destination);
		}
		
		function setupCanvas()
		{
			canvasElement = document.querySelector('canvas');
			drawCtx = canvasElement.getContext("2d");
		}

		function setupImage()
        {
			image.onload = e => 
			{
				drawCtx.save();
				drawCtx.clearRect(0,0,drawCtx.canvas.width,drawCtx.canvas.height)
				drawCtx.scale(.5,.5);
				drawCtx.drawImage(image, 0, 0);
				drawCtx.restore();
			}
			sunImage.onload = e =>
			{
				drawCtx.save();
				drawCtx.clearRect(0,0,drawCtx.canvas.width,drawCtx.canvas.height)
				drawCtx.scale(.5,.5);
				drawCtx.drawImage(image, 0, 0);
				drawCtx.restore();
			}
		}

        function setupUI()
        {
			playButton = document.querySelector("#playButton");
			playButton.onclick = e => 
			{
				//console.log(`audioCtx.state = ${audioCtx.state}`);
				// check if context is in suspended state (autoplay policy)
				if (audioCtx.state == "suspended") {
					audioCtx.resume();
				}

				if (e.target.dataset.playing == "no") 
				{
					audioElement.play();
					e.target.dataset.playing = "yes";

				// if track is playing pause it
				} else if (e.target.dataset.playing == "yes") 
				{
					audioElement.pause();
					e.target.dataset.playing = "no";
				}
	
			};
			
			
			let volumeSlider = document.querySelector("#volumeSlider");
            volumeSlider.oninput = e => 
            {
				gainNode.gain.value = e.target.value;
				volumeLabel.innerHTML = Math.round((e.target.value/2 * 100));
			};
			volumeSlider.dispatchEvent(new InputEvent("input"));

			let radiusSlider = document.querySelector("#radiusSlider");
			radiusSlider.oninput = e => 
			{
				maxRadius = e.target.value * 100;			
				radiusLabel.innerHTML = Math.round((e.target.value/2 * 100));		
			};
			radiusSlider.dispatchEvent(new InputEvent("input"));

			let barWidthSlider = document.querySelector("#barWidthSlider");
			barWidthSlider.oninput = e => 
			{
				barWidth = e.target.value * 100;
				barWidthLabel.innerHTML = Math.round((e.target.value/2 * 100));
			};
			radiusSlider.dispatchEvent(new InputEvent("input"));
			
			
            document.querySelector("#trackSelect").onchange = e =>
            {
				audioElement.src = e.target.value;
				// pause the current track if it is playing
				playButton.dispatchEvent(new MouseEvent("click"));
			};
			
			//canvas color
            document.querySelector("#canvasColor").onchange = function(e)
		    {
				ctxColor = e.target.value;
			};
            
			//bar color
            document.querySelector("#barColor").onchange = function(e)
		    {
				color = e.target.value;
			};

			//default color value
			color = 'rgba(175, 137, 148,0.8)';

			// if track ends
			audioElement.onended =  _ => 
			{
				playButton.dataset.playing = "no";
			};
			
            document.querySelector("#fsButton").onclick = _ =>
            {
				app.helper.requestFullscreen(canvasElement);
			};

			barWidth = 10;	
		}

		function update() 
		{ 
			// this schedules a call to the update() method in 1/60 seconds
			requestAnimationFrame(update);

            //check box logic
			if(document.querySelector("#tintCB").checked == true)
			{
				showTint = true;
				//console.log("tintRed = " + tintRed);
			}
			else if(document.querySelector("#tintCB").checked == false)
			{
				showTint = false;
				//console.log("tintRed = " + tintRed);
			}
			
			if(document.querySelector("#invertCB").checked == true)
			{
				showInvert = true;
				//console.log("invert = " + invert);
			}
			else if(document.querySelector("#invertCB").checked == false)
			{
				showInvert = false;
				//console.log("invert = " + invert);
			}

			if(document.querySelector("#noiseCB").checked == true)
			{
				showNoise = true;
				//console.log("noise = " + noise);
			}
			else if(document.querySelector("#noiseCB").checked == false)
			{
				showNoise = false;
				//console.log("noise = " + noise);
			}

			if(document.querySelector("#sepiaCB").checked == true)
			{
				showSepia = true;
				//console.log("sepia = " + sepia);
			}
			else if(document.querySelector("#sepiaCB").checked == false)
			{
				showSepia = false;
				//console.log("sepia = " + sepia);
			}

			//audio filter for vaporwave type
			let filterButton =  document.querySelector("#audioFilter");
			if(filterButton.checked)
			{
				//vaporwave off
				noFilterBool = true;
			}
			//waveform
			else if(filterButton.checked == false)
			{
				//default = false, vaporwave effect
				noFilterBool = false;
			}
			
			//radio button truth value check
			let defaultButton = document.querySelector("#default");
			if(defaultButton.checked)
			{
				defaultBool = true;
			}
			else if(defaultButton.checked == false)
			{
				//default = false, then reverse.
				defaultBool = false;
			}

			//form type
			let audioButton =  document.querySelector("#audioDatatype");
			if(audioButton.checked)
			{
				//frequency
				audioType = "frequency";
			}
			//waveform
			else if(audioButton.checked == false)
			{
				//default = false, waveform
				audioType = "waveform";
			}
           
			/*
				Nyquist Theorem
				http://whatis.techtarget.com/definition/Nyquist-Theorem
				The array of data we get back is 1/2 the size of the sample rate 
			*/
			
			// populate the audioData with the frequency data
			// notice these arrays are passed "by reference" 
            analyserNode.getByteFrequencyData(audioData);
            	
			// OR
            //analyserNode.getByteTimeDomainData(audioData); // waveform data
            
			//
			barSpacing = 2;
			barHeight = 80;
            topSpacing = 10;
            
			// DRAW!
            drawCtx.clearRect(0,0,1200,600);  
            
            drawCtx.save();
            drawCtx.fillStyle = ctxColor;
            drawCtx.fillRect(0,0,1200,600);
            drawCtx.fill();
			drawCtx.restore();

			let hours = Math.floor(audioElement.duration / 60);
			let seconds = Math.floor(audioElement.duration - hours * 60);
			let minutes = Math.floor(audioElement.duration / 60);
			let currentHours = Math.floor(audioElement.currentTime / 60);
			let currentSeconds = Math.floor(audioElement.currentTime - currentHours * 60)
			let currentMinutes = Math.floor(audioElement.currentTime / 60);
			let tempDigit;

			//to do double digits even when seconds are less than 10
			if(currentSeconds < 10)
			{
				tempDigit = "0";
			}
			else
			{
				tempDigit = ""
			}
			
			//let seconds = Math.floor(audioElement.currentTime);
			document.querySelector("#time").innerHTML = currentMinutes + ":" + tempDigit + currentSeconds + " / " + minutes + ":" + seconds;
			
			
			// loop through the data and draw!
			for(let i = 0; i < audioData.length; i++) 
			{ 
				//drawCtx.fillStyle = 'rgba(0,255,0,0.6)'; 
				
				// the higher the amplitude of the sample (bin) the taller the bar
				// remember we have to draw our bars left-to-right and top-down
				//drawCtx.fillRect(i * (barWidth + barSpacing),topSpacing + 256-audioData[i],barWidth,barHeight); 
				
				//draw inverted red bars
				//drawCtx.fillStyle = 'rgba(255,0,0,0.6)';
				//drawCtx.fillRect(640 - i * (barWidth + barSpacing), topSpacing + 256 - audioData[i] - 20, barWidth, barHeight);
				//must use firefox / safari to get audio player to work.

				if(defaultBool)
				{
					drawCtx.scale(1,1);
				}
				//not default, so reverse
				else if (defaultBool == false)
				{
					//reverse
					drawCtx.translate(canvasElement.width, canvasElement.height);
					drawCtx.scale(-1,-1);
				}
					let percent = audioData[i] / 255;
					//let maxRadius = 200;
					let circleRadius = percent * maxRadius;

					//drawing hill
					drawCtx.save();
					drawCtx.globalAlpha = 0.5;
					drawCtx.drawImage(image, 0, 50);
					drawCtx.restore();

					//drawing sun
					drawCtx.save();
					drawCtx.globalAlpha = 0.5;
					drawCtx.scale(0.5, 0.5);
					drawCtx.drawImage(sunImage, -50, 50);
					drawCtx.restore()

					if(audioType == "frequency")
					{
						drawCtx.fillStyle = color;
						drawCtx.fillRect(1200 - i * (barWidth + barSpacing), topSpacing + 550 - audioData[i] - 110, barWidth, barHeight);
					}

					//unoptimized
					if(audioType == "waveform")
					{
						drawCtx.save();
						drawCtx.fillStyle = color;
						drawCtx.strokeStyle = color;
						let v = audioData[i] / 128.0;
						let y = topSpacing + 550 - audioData[i] + 200;
						let width = (canvasElement.width / bufferLength);
						let x = 1200 - i * (barWidth + barSpacing);

						if(i == 0) 
						{
							drawCtx.moveTo(x, y);
						} 
						else 
						{
							drawCtx.lineTo(x, y);
						}

						x += width;

						drawCtx.lineTo(barWidth, barHeight);
						drawCtx.stroke();
						drawCtx.restore();
					}

					//clearing occasionally
					if(percent == maxRadius / 2)
					{
						drawCtx.clearRect(0, 0 , canvasElement.width, canvasElement.height);
					}
		
					//drawing medium circles
					drawCtx.beginPath();
					drawCtx.fillstyle = app.helper.makeColor(255, 111, 111, .10 - percent/10.0);
					drawCtx.arc(canvasElement.width/2, canvasElement.height - 50, circleRadius, 0, 2 * Math.PI, false);
					drawCtx.fill();
					drawCtx.closePath();

					// //drawing large circles
					drawCtx.beginPath();
					drawCtx.fillStyle = app.helper.makeColor(200, 100, 100, .10 - percent / 20.0);
					drawCtx.arc(canvasElement.width/2, canvasElement.height - 50, circleRadius * 2, 0, 2 * Math.PI, false);
					drawCtx.fill();
					drawCtx.closePath();

					// small circles
					drawCtx.beginPath();
					drawCtx.fillStyle = app.helper.makeColor(200, 200, 0, .5 - percent/5.0);
					drawCtx.arc(canvasElement.width/2, canvasElement.height - 50, circleRadius * .5, 0, 2 * Math.PI, false);
					drawCtx.fill();
					drawCtx.closePath();

					//drawing half circles - middle
					drawCtx.beginPath();
					drawCtx.fillStyle = app.helper.makeColor(255, 180, 180, .5 - percent/5.0);
					drawCtx.arc(canvasElement.width/2, canvasElement.height - 50, circleRadius * 1.2, 0, Math.PI, true);
					drawCtx.fill();
					drawCtx.closePath();

					//left
					drawCtx.beginPath();
					drawCtx.fillStyle = app.helper.makeColor(255, 180, 180, .5 - percent/5.0);
					drawCtx.arc(0, canvasElement.height - 50, circleRadius * 1.1, 0, Math.PI, true);
					drawCtx.fill();
					drawCtx.closePath();

					//drawing circles - large left
					drawCtx.beginPath();
					drawCtx.fillStyle = app.helper.makeColor(200, 100, 100, .10 - percent / 20.0);
					drawCtx.arc(0, canvasElement.height - 50, circleRadius * 1.5, 0, 2 * Math.PI, false);
					drawCtx.fill();
					drawCtx.closePath();

					//right
					drawCtx.beginPath();
					drawCtx.fillStyle = app.helper.makeColor(255, 180, 180, .5 - percent/5.0);
					drawCtx.arc(canvasElement.width - 50, canvasElement.height , circleRadius * 1.1, 0, Math.PI, true);
					drawCtx.fill();
					drawCtx.closePath();

					//drawing circles - large right
					drawCtx.beginPath();
					drawCtx.fillStyle = app.helper.makeColor(200, 100, 100, .10 - percent / 20.0);
					drawCtx.arc(canvasElement.width - 50, canvasElement.height - 50, circleRadius * 1.5, 0, 2 * Math.PI, false);
					drawCtx.fill();
					drawCtx.closePath();
				}

			//draw sprites
			//loop through the sprites
			// drawCtx.save();
			// let counter = 0;
			// for (let s of spriteArray)
			// {
			// 	// move sprites
			// 	let percent = (audioData[counter]/255);
			// 	s.speed = percent * 20;
			// 	s.fwd = direction;

			// 	if (s.x > canvasElement.width)
			// 	{
			// 		s.x;
			// 	}

			// 	// draw sprites
			// 	drawCtx.save();
			// 	counter++;
			// 	s.draw(drawCtx, spriteImage);
			// 	//debugger;
			// 	drawCtx.restore();
			// 	s.move();
			// } 
			app.helper.toggleLowshelf(audioCtx, biquadFilter, noFilterBool);
			app.helper.manipulatePixels(drawCtx, showTint, showInvert, showNoise, showSepia, noFilterBool);
		} 
})();
