var app = app || {};
    
app.helper = (function(){

    // HELPER FUNCTIONS
    function makeColor(red, green, blue, alpha)
    {
           var color='rgba('+red+','+green+','+blue+', '+alpha+')';
           return color;
    }

    function manipulatePixels(ctx, showTint, showInvert, showNoise, showSepia)
    {
        
        // gets all the rgba pixel data of the canvas by grabbing the image data object
        let imageData = ctx.getImageData(0,0, ctx.canvas.width, ctx.canvas.height);

        //imageData.data is an 8 bit typed array (ranges from 0-255) and it 
        //contains 4 values per pixel, 4 x canvas.width x canvas.height, 1,024,000 values
        let data = imageData.data;
        let length = data.length;
        let width = imageData.width;

        //iterate through each pixel, data[i], i+1, i+2, i+3 (r,g,b,a)
        let i; // declaring i outside loop for optimization purposes
        
        //manipulate the pixels of image data based on filters applied
        for(i = 0; i< length; i+=4)
        {
            let red = data[i]; 
            let green = data[i+1];
            let blue = data[i+2];

            if(showTint)
            {
                //loop through each pixel and add onto the red value
                data[i] = data[i] + 20;
                data[i+1] = data[i+1] + 5;
                data[i+2] = data[i+2] + 30;
            }

            if(showInvert)
            {
                
                 data[i] = 255 - red; // r value altered
                 data[i+1] = 255 - green; // g value altered
                 data[i+2] = 255 - blue; //b value altered
                 //we're not doing anything to alpha value data[i+3]
            }

            if(showNoise && Math.random() < .10)
            {
                data[i] = data[i+1] = data[i+2] = 128; //gray noise
                //data[i] = data[i+1] = data[i+2] = 255; // white noise
                //data[i] = data[i+1] = data[i+2] = 0; // black noise
                data[i+3] = 255; // alpha
            }

            //sepia tone
            if(showSepia)
            {
                data[i] = (red * .393) + (green * .769) + (blue * .189);
                data[i+1] = (red * .349) + (green * .686) + (blue * .168);
                data[i+2] = (red * .272) + (green * .534) + (blue * .131);
            }
        }
            //then put the data back on the canvas
            ctx.putImageData(imageData, 0, 0);
    }
    function toggleLowshelf(audioCtx, biquadFilter, noFilterBool)
    {
        if(noFilterBool == false)
        {
          biquadFilter.frequency.setValueAtTime(100, audioCtx.currentTime);
          biquadFilter.gain.setValueAtTime(45, audioCtx.currentTime);
        }
        else
        {
          biquadFilter.gain.setValueAtTime(0, audioCtx.currentTime);
        }
    }
    function manipulatePixels(ctx, showTint, showInvert, showNoise, showSepia, noFilterBool)
    {
        // gets all the rgba pixel data of the canvas by grabbing the image data object
        let imageData = ctx.getImageData(0,0, ctx.canvas.width, ctx.canvas.height);

        //imageData.data is an 8 bit typed array (ranges from 0-255) and it 
        //contains 4 values per pixel, 4 x canvas.width x canvas.height, 1,024,000 values
        let data = imageData.data;
        let length = data.length;
        let width = imageData.width;

        //iterate through each pixel, data[i], i+1, i+2, i+3 (r,g,b,a)
        let i; // declaring i outside loop for optimization purposes
        
        //manipulate the pixels of image data based on filters applied
        for(i = 0; i< length; i+=4)
        {
            let red = data[i]; 
            let green = data[i+1];
            let blue = data[i+2];

            if(showTint)
            {
                //loop through each pixel and add values to produce tint
                data[i] = data[i] + 20;
                data[i+1] = data[i+1] + 5;
                data[i+2] = data[i+2] + 30;
            }

            if(noFilterBool == false)
            {
                 //loop through each pixel and add greenish tint
                 data[i+1] = data[i+1] + 5;
            }

            if(showInvert)
            {
                
                 data[i] = 255 - red; // r value altered
                 data[i+1] = 255 - green; // g value altered
                 data[i+2] = 255 - blue; //b value altered
                 //we're not doing anything to alpha value data[i+3]
            }

            if(showNoise && Math.random() < .10)
            {
                data[i] = data[i+1] = data[i+2] = 128; //gray noise
                //data[i] = data[i+1] = data[i+2] = 255; // white noise
                //data[i] = data[i+1] = data[i+2] = 0; // black noise
                data[i+3] = 255; // alpha
            }

            //sepia tone
            if(showSepia)
            {
                data[i] = (red * .393) + (green * .769) + (blue * .189);
                data[i+1] = (red * .349) + (green * .686) + (blue * .168);
                data[i+2] = (red * .272) + (green * .534) + (blue * .131);
            }
        }
            //then put the data back on the canvas
            ctx.putImageData(imageData, 0, 0);
    }

    //create petal sprites
    function createSprites(ctx, num, image)
	{
		// create array to hold sprites
		let sprites = [];

		for(let i=0; i < num; i++)
        {
	
			// add properties
			let x = ctx.width - Math.random(0, ctx.width);
			let y = ctx.height - (20 * i);
			let fwd = {x:1, y:0}; //getRandomUnitVector();
			let speed = Math.random() + 2;
            let spriteImage = image;
            let s = new SakuraSprite(x, y, fwd, speed, spriteImage);

			// add to array
			sprites.push(s);

		}
	
		// return  array
		return sprites;
    }
    
    class SakuraSprite
    {
        constructor(x, y, fwd, speed, image)
        {
            this.x = x;
            this.y = y;
            this.fwd = fwd;
            this.speed = speed;
            this.image = image;
        }

            //add methods
			draw(ctx, image)
            {
                //drawing hill
				ctx.save();
                ctx.globalAlpha = 0.5;
                ctx.scale(0.2, 0.2);
                ctx.drawImage(image, 500, 500);
				ctx.restore();
			}
		
			move()
            {
				this.x += this.fwd.x * (this.speed / 2);
				this.y += this.fwd.y * this.speed;
			}

			reflectX()
            {
				this.fwd.x *= -1;
			}

			reflectY()
            {
				this.fwd.y *= -1;
			}	 
        
    }
    
    function requestFullscreen(element) 
    {
        if (element.requestFullscreen) 
        {
          element.requestFullscreen();
        }
         else if (element.mozRequestFullscreen) 
        {
          element.mozRequestFullscreen();
        } 
        else if (element.mozRequestFullScreen) 
        { 
          // camel-cased 'S' was changed to 's' in spec
          element.mozRequestFullScreen();
        } 
        else if (element.webkitRequestFullscreen) 
        {
          element.webkitRequestFullscreen();
        }
        
    };  

    //publicly return functions
    return{
        makeColor: makeColor,
        toggleLowshelf: toggleLowshelf,
        manipulatePixels: manipulatePixels,
        requestFullscreen: requestFullscreen,
        createSprites: createSprites,


    }
})();