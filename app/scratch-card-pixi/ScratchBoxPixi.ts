/*
 * Author: mohdsidani@gmail.com
 * Created: Wednesday, September 14, 2015
 */

/// <reference path="./../../tools/typings/angularjs/angular.d.ts" />
/// <reference path="./../../tools/typings/PixiJS/pixi.d.ts" />

module ScratchCard {
     class Scratchboxpixi implements ng.IDirective {

     	static instance() : ng.IDirective {
			return new Scratchboxpixi();
		}

		restrict = 'E';

		template = '';

		replace = true;

		link: (scope, element, attrs, ctrl) => void;

		constructor() {

			let error: Error;

			let injector: any = angular.injector(['ScratchCard']);

			let options: any = injector.get('__OPTIONS__');

			let $q: any = injector.get('$q');

			let $timeout: ng.ITimeoutService = injector.get('$timeout');
				
			this.link = (window.PIXI !== undefined && window.PIXI !== null && typeof window.PIXI === 'object') ? 

						linkFn : //PixiJS exists so return it as the main game link function

						() => {  //PixiJS doesn't exist so return an ananymous function that sets and throws an error
								error = new Error('PixiJS script doesnt exist in the current context environment, ' +
					  			  'Place the script down the in document body.' +
					  			  'Donwload it from: http://pixijs.github.io/docs/index.html \n');
								throw error 
							  };

			if (error === undefined) {
				this.template = options.__ROOTTEMPLATE__;
			}

			function linkFn(scope, element, attrs, ctrl): void {
				/*
				 *	* Private Utils *
				 */

				/*	
				 *	* Main Calculated Variables Sizes used for the scrach brush box *
				 * 	*****************************************************************
				 */
				let brushBoxPadding: number;
				let matrixRowX: number;
				let matrixColY: number;
				let brushSize: number;
				let width: number;
				let height: number;
				let gameCanvasWidth: number;
				let gameCanvasHeight: number;
				let brushBoxWidth: number;
				let brushBoxHeight: number;
				let spaceBetweenBrushBoxesY: number;
				let spaceBetweenBrushBoxesX: number;
				let brushBoxPositionY: number;
				let brushBoxPositionX: number;


				/*	
				 *	* Main URLS fors sprites & data used for scrath boxes  *
				 * 	********************************************************
				 */
				let brushBoxBackgroundURL: string;
				let mainBackgroundImageURL: string;
				let brushImageURL: string ;
				let randomImages: string;


				/*	
				 *	* Game Objects needed for building the game  *
				 * 	********************************************** 
				 */
				let mainGameCanvas: any;				
				let mainGameContext2D: any;
				let gameStageContainer: any;
				let mainBackgroundImage: any;
				let htmlTemplateRenderer: HTMLElement;
				let brushBoxRandomImages: any = [];
				let brushBoxStage: any = [[], [], []];
				let brushBoxPrizeSpritesCoverOver: any = [[], [], []];
				let brushBoxPrizeSprites: any = [[], [], []];
				let brushBoxContext2Ds: any = [[], [], []];
				let brushBoxCanvasTexturesView: any = [[], [], []];
				let brushImageData: ImageData;
				let scratchBoxRendererFn: any = [[], [], []];
				let scratchBoxBounds: any = [[], [], []];

				let boxPrizeCover: HTMLImageElement = new Image();
				let scratchImage: HTMLImageElement = new Image();


				/*
				 *	* Main math options * 
				 */
				brushBoxPadding = options.__BRUSHBOXPADDING__;
				matrixRowX = options.__MATRIXROWX__;
				matrixColY = options.__MMATRIXCOLY__;
				brushSize = options.__BRUSHSIZE__;
				width = options.__BRUSHBOXWIDTH__;
				height = options.__BRUSHBOXHEIGHT__;
				brushBoxWidth = width / matrixRowX;
				brushBoxHeight = height / matrixColY;
				spaceBetweenBrushBoxesY = brushBoxPadding;
				spaceBetweenBrushBoxesX = brushBoxPadding;
				brushBoxPositionY = brushBoxPadding;
				brushBoxPositionX = brushBoxPadding;
				

				/*
				 *	* The prize sprites that will be randomly placed in each container *
				 */
				randomImages = options.__PRIZEIMAGES__;
				brushBoxRandomImages = JSON.parse(JSON.stringify(randomImages)).split('-').map((current, index, arr) => {
					return current.split(',');
				});


				/*
				 *	* Main background sprite *
				 */
				mainBackgroundImageURL = options.__MAINBACKGROUNDIMAGE__;
				mainBackgroundImage = PIXI.Sprite.fromImage(mainBackgroundImageURL);
				mainBackgroundImage.cacheAsBitmapboolean = true;
				mainBackgroundImage.name = 'mainBackgroundImage';
				mainBackgroundImage.height = gameCanvasHeight;
				mainBackgroundImage.width = gameCanvasWidth;
				mainBackgroundImage.x = 0; 
				mainBackgroundImage.y = 0; 

				
				/* 
				 *	* Loading images used for scratching *
				 */
				brushBoxBackgroundURL = options.__BRUSHBOXBOACKGROUND__;
				brushImageURL = options.__BRUSHIMAGE__; 

				boxPrizeCover.src = brushBoxBackgroundURL;
				boxPrizeCover.width = brushBoxWidth;
				boxPrizeCover.height = brushBoxHeight;

				scratchImage.src = brushImageURL;
				scratchImage.width = brushSize;
				scratchImage.height = brushSize;


				/*
				 *	* Main game canvas *
				 */
				gameCanvasWidth = width + (matrixRowX * brushBoxPadding) + (brushBoxPadding * 3); 
				gameCanvasHeight = height + (matrixColY * brushBoxPadding) + (brushBoxPadding * 3);

				mainGameCanvas = new PIXI.CanvasRenderer(gameCanvasWidth, gameCanvasHeight); 
				mainGameCanvas.interactive = true;
				mainGameCanvas.transparent = true;

				mainGameContext2D = mainGameCanvas.view.getContext('2d');


				/*
				 *	* Main game container *
				 */
				gameStageContainer =  new PIXI.Container();
				gameStageContainer.interactive = true;


				/*
				 *	* The HTML view where the game canvas will be appended * 
				 */
				htmlTemplateRenderer = element[0];
				htmlTemplateRenderer.appendChild(mainGameCanvas.view);


				/* 
				 *	* Add Background image *
				 */
				gameStageContainer.addChild(mainBackgroundImage);


				/*	*********************************************************
				 *	* This process renders the game and creates and fills the main display objects required for the game *
				 *	* Lazy loading images used for scratching and cover box *
				 */
				ctxPicsLoaded(boxPrizeCover, () => {}).then(
					(response)=> { 
						ctxPicsLoaded(scratchImage, () => {}).then(
							(response)=> { 
								getBrushedImageData();
								RenderGame();
								createMatrixDisplayObjects(); 
							}, 
							()=> {}
						);
					}, 
					()=> {}
				);


				/*
				 *	* Lazy loading images used for scratching and cover box *
				 */
				function ctxPicsLoaded(object, onloadFn): any {
					return $q((resolve, reject) => {
						object.onLoad = onloadFn;
						$timeout(() => {
							resolve('successfully.loaded.');
						});
					});
				}


				/* 
				 *	* Get the scratched image pixel data: *** brushImageData *** *
				 *	**************************************
				 * 	******* the image will be used instead of the default rectangle when using the putImageData function *******
				 */
				function getBrushedImageData(): void {
					let tempCanvs: HTMLCanvasElement = document.createElement('canvas');
					let tempCtx = tempCanvs.getContext('2d');
					let data: Uint8ClampedArray;
					let length: any;

					tempCanvs.width = brushSize;
					tempCanvs.height = brushSize;

					/*	* Scratch image data *	*/
					//tempCtx.globalAlpha = 0;
					tempCtx.beginPath();
					tempCtx.drawImage(scratchImage, 0, 0, brushSize, brushSize);
					tempCtx.fill();

					brushImageData = tempCtx.getImageData(0, 0, brushSize, brushSize);
					data = brushImageData.data;
					length = data.length;


					// for(let i = 0; i < length; i++){  
					//     data[i] = 1;
					// }

					// after the manipulation, reset the data
					//brushImageData.data = data;

					// and put the imagedata back to the canvas
					
					tempCtx.putImageData(brushImageData, 0, 0);

					// Review this to add your own scratch sprite
						// brushImageData = new ImageData(brushImageData.data, brushSize, brushSize);
						// scratchImage.src = tempCanvs.toDataURL();
					//or use the default transparent rectangle
					brushImageData = new ImageData(brushSize, brushSize);
				}	


				/*	
				 * 	* Creates the game display objects *
				 */ 
				function createMatrixDisplayObjects(): void {
					for (let row: number = 0; row < matrixRowX; ++row) {

						spaceBetweenBrushBoxesX = brushBoxPadding;

						for (let col: number = 0; col < matrixColY; ++col) {

							/*
							 *	* Brush Box Image Sprites PRIZES *
							 */
							brushBoxPrizeSprites[row][col] = PIXI.Sprite.fromImage(brushBoxRandomImages[row][col]);
							brushBoxPrizeSprites[row][col].cacheAsBitmapboolean = true;
							brushBoxPrizeSprites[row][col].height = brushBoxHeight - 3;
							brushBoxPrizeSprites[row][col].width = brushBoxWidth -3;
							brushBoxPrizeSprites[row][col].row = row;
							brushBoxPrizeSprites[row][col].col = col;
							brushBoxPrizeSprites[row][col].x = 3;
							brushBoxPrizeSprites[row][col].y = 3;

							/* 
							 *	* Create a canvas element used as a texture for the cover sprite *
							 */
							brushBoxCanvasTexturesView[row][col] = new PIXI.CanvasRenderer(brushBoxWidth, brushBoxHeight); 
							brushBoxCanvasTexturesView[row][col].interactive = true;
							brushBoxCanvasTexturesView[row][col].transparent = true;
							brushBoxCanvasTexturesView[row][col].row = row;
							brushBoxCanvasTexturesView[row][col].col = col;
							brushBoxCanvasTexturesView[row][col].width = brushBoxWidth;
							brushBoxCanvasTexturesView[row][col].height = brushBoxHeight;
							brushBoxCanvasTexturesView[row][col].x = brushBoxPositionX + spaceBetweenBrushBoxesX;
							brushBoxCanvasTexturesView[row][col].y = brushBoxPositionY + spaceBetweenBrushBoxesY;


							/* 
							 *	* Create the context 2d for the canvas element *
							 */
							brushBoxContext2Ds[row][col] = brushBoxCanvasTexturesView[row][col].view.getContext('2d');
							brushBoxContext2Ds[row][col].beginPath();
							brushBoxContext2Ds[row][col].drawImage(boxPrizeCover, 0, 0, brushBoxWidth, brushBoxHeight);
							brushBoxContext2Ds[row][col].fill();

							/* 
							 *	* Create a texture to be used as a canvas for the cover sprite *
							 */
							let texture: PIXI.Texture = PIXI.Texture.fromCanvas(brushBoxCanvasTexturesView[row][col].view);

							/* 
							 *	* The cover sprite that has a canvas texture *
							 */
							brushBoxPrizeSpritesCoverOver[row][col] = new PIXI.Sprite();
							brushBoxPrizeSpritesCoverOver[row][col].cacheAsBitmapboolean = true;
							brushBoxCanvasTexturesView[row][col].transparent = true;
							brushBoxPrizeSpritesCoverOver[row][col].row = row;
							brushBoxPrizeSpritesCoverOver[row][col].col = col;
							brushBoxPrizeSpritesCoverOver[row][col].height = brushBoxHeight;
							brushBoxPrizeSpritesCoverOver[row][col].width = brushBoxWidth;
							brushBoxPrizeSpritesCoverOver[row][col].x = 0;
							brushBoxPrizeSpritesCoverOver[row][col].y = 0;
							/*	* texture represented as a canvas in order to scratch areas of this cover image *	*/
							brushBoxPrizeSpritesCoverOver[row][col].texture = texture;

							/* 
							 *	* Brush Box Stage Containers *
							 */
							brushBoxStage[row][col] = new PIXI.Container();
							brushBoxStage[row][col].interactive = true;
							brushBoxStage[row][col].height = brushBoxHeight;
							brushBoxStage[row][col].width = brushBoxWidth;
							brushBoxStage[row][col].row = row;
							brushBoxStage[row][col].col = col;
							brushBoxStage[row][col].x = brushBoxPositionX + spaceBetweenBrushBoxesX;
							brushBoxStage[row][col].y = brushBoxPositionY + spaceBetweenBrushBoxesY;
	

							/* 
							 *	* Adding the Assembeled Game Objects *
							 */ 
							gameStageContainer.addChild(brushBoxStage[row][col]);

							brushBoxStage[row][col].addChild(brushBoxPrizeSprites[row][col]); // prize sprite
							brushBoxStage[row][col].addChild(brushBoxPrizeSpritesCoverOver[row][col]); // cover sprite


							/*
							 *	*  mousemove event and calculate the hit points *	
							 */
							brushBoxStage[row][col].on('mouseover', mouseover);
							brushBoxStage[row][col].on('mouseout', mouseout);


							spaceBetweenBrushBoxesX += brushBoxWidth + brushBoxPadding; 
						}
						spaceBetweenBrushBoxesY += brushBoxHeight + brushBoxPadding;
					}	
				}

		
				/*
				 *	* Animate Game *
				 */
				function RenderGame(): void {
				 	requestAnimationFrame(RenderGame);
				 	mainGameCanvas.render(gameStageContainer);
				}


		 		function mouseover(event): void {
					let row = event.target.row;
					let col = event.target.col;
					brushBoxStage[row][col].on('mousemove', brushScratch);
				}

				function mouseout(event): void {
					let row = event.target.row;
					let col = event.target.col;
					brushBoxStage[row][col]._events['mousemove'] = null;
				}

				function brushScratch(event): void  {
					/*
					 *	* Mouse X and Mouse Y from regular js event *
					 */
					let x = event.data.global.x;
					let y = event.data.global.y;

					/*
					 *	* row and column of the current mousemove item *
					 */
					let row: number = event.target.row; 
					let col: number = event.target.col; 

					brushBoxContext2Ds[row][col].globalAlpha = 0;
					brushBoxContext2Ds[row][col].beginPath();
					brushBoxContext2Ds[row][col].translate((brushSize/2), (brushSize/2));
					brushBoxContext2Ds[row][col].rotate(90 * (Math.PI / 180));
					brushBoxContext2Ds[row][col].putImageData(brushImageData, x - brushBoxCanvasTexturesView[row][col].x - (brushSize), y - brushBoxCanvasTexturesView[row][col].y - (brushSize));
					brushBoxContext2Ds[row][col].fill();


					// brushBoxContext2Ds[row][col].beginPath();
					// brushBoxContext2Ds[row][col].fillStyle = "#FFFFFF";
					// brushBoxContext2Ds[row][col].translate((brushSize/2), (brushSize/2));
					// brushBoxContext2Ds[row][col].rotate(90 * (Math.PI / 180));
					// brushBoxContext2Ds[row][col].drawImage(scratchImage, x - brushBoxCanvasTexturesView[row][col].x - (brushSize), y - brushBoxCanvasTexturesView[row][col].y - (brushSize));
					// brushBoxContext2Ds[row][col].arc(x - brushBoxCanvasTexturesView[row][col].x - (brushSize), y - brushBoxCanvasTexturesView[row][col].y - (brushSize), 25, 0, 2 * Math.PI);

					// brushBoxContext2Ds[row][col].fill(); 

				}

			} //end linkFn
			
		} //end constructor

	} //end class

	angular.module('ScratchCard').directive('scratchboxpixi', Scratchboxpixi.instance);
}