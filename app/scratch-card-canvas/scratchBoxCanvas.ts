/// <reference path="./../../tools/typings/angularjs/angular.d.ts" />

angular.module("ScratchCard").directive("scratchboxcanvas", scratchboxcanvas);

function scratchboxcanvas(): Object { 

	let directive: ng.IDirective = {
		restrict: 'E',
		template: '<div id="renderered"></div> ',
		replace: true,
		link: linkFn
	};

	return directive;

	function linkFn(scope, element, attrs, ctrl): void {

		let scratchBox = element[0];
		let padding = Number(attrs.padding);
		let matrixX = Number(attrs.matrixx);
		let matrixY = Number(attrs.matrixy);
		let width = Number(attrs.width);
		let height = Number(attrs.height);
		let brushSize = Number(attrs.brushsize);
		let fullWidth = width + (matrixX * padding) + (padding * 3);
		let fullHeight = height + (matrixY * padding) + (padding * 3);
		let imgHeight = height / matrixY;
		let imgWidth = width / matrixX;
		let length = matrixX * matrixY;
		let images = [];
		let scratchSprites = [];
		let scratchImage;
		let canvases = [];
		let contexts2D = []; 
		let posX, posY, jumpY, jumpX;	
		let brushImageData = new ImageData(brushSize, brushSize);
		brushImageData.data[0] = 1;
		brushImageData.data[1] = 1;
		brushImageData.data[2] = 1;
		brushImageData.data[3] = 1;

		images = JSON.parse(JSON.stringify(attrs.images)).split('-').map((current, index, arr) => {
			return current.split(',');
		});

		canvases = [
			[],
			[],
			[]
		];

		contexts2D = [
			[],
			[],
			[]
		];

		scratchBox.style.height = fullHeight + 'px';
		scratchBox.style.width = fullWidth + 'px';
	

		posX = padding;
		posY = padding;
		jumpX = padding;
		jumpY = padding;

		for (let col = 0; col < matrixX; ++col) {

			jumpX = padding;

			for (let row = 0; row < matrixY; ++row) {

				canvases[row][col] = document.createElement('canvas');
				canvases[row][col].id = col;
				canvases[row][col].classList.add(row);
				canvases[row][col].width = imgWidth;
				canvases[row][col].height = imgHeight;
				canvases[row][col].style.background = 'url(' + images[col][row] + ') no-repeat center center';
				canvases[row][col].style.position = 'absolute';
				canvases[row][col].style.border = '2px solid white';
				canvases[row][col].style.left = posX + jumpX + 'px';
				canvases[row][col].style.marginTop = posY + jumpY + 'px';

				scratchBox.appendChild(canvases[row][col]);

				contexts2D[row][col] = canvases[row][col].getContext('2d');

				contexts2D[row][col].beginPath();
				contexts2D[row][col].rect(0, 0, imgWidth, imgHeight);
				contexts2D[row][col].fillStyle = "black";
				contexts2D[row][col].fill();

				canvases[row][col].addEventListener('mousemove', brush);
				canvases[row][col].addEventListener('touchstart', brush);


				jumpX += imgWidth + padding; 
			}

			jumpY = jumpY + imgHeight + padding;
		}


		function brush(event): void {

			let x = event.layerX;
			let y = event.layerY;

			let col = event.target.id;
			let row = event.target.className;

		    contexts2D[row][col].beginPath();
		    contexts2D[row][col].putImageData(brushImageData, x - (brushSize / 2), y - (brushSize / 2));
		    contexts2D[row][col].fill();
		}

	}
}