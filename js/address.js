
function getaddressio_select(event){
	const select = event.target;
	select.classList.add('address__select--loading');
	const root = select.parentNode.parentNode;
	const address_type = select.parentNode.id.replace(/([a-z]+)\_address\_search\_field/gi, '$1');
	const url = wcgaio.ajax_url;
	const post_params = [];
	post_params.push('action=' + encodeURIComponent('wcgaio_address_details'));
	post_params.push('token=' + encodeURIComponent(wcgaio.detail_token));
	post_params.push('address_id=' + encodeURIComponent(select.value));
		
	const old_err = root.querySelector('.address__error');
	if(old_err){
		old_err.remove();
	}
	
	if(select.value.length){
	
		fetch(url, {
			method: 'POST',
			mode: 'same-origin',
			cache: 'no-cache',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			redirect: 'follow',
			referrerPolicy: 'no-referrer',
			body: post_params.join('&')
		})
		.then((response) => {
			if(!response.ok){
				throw new Error(response.status);
			}
			return response.json();
		})
		.then((data) => {

			select.classList.remove('address__select--loading');

			const address_line1 = root.querySelector('#' + address_type + '_address_1');
			if(address_line1){
				address_line1.value = data.line_1;
			}
			const address_line2 = root.querySelector('#' + address_type + '_address_2');

			const line_2 = [];
			if(data.line_2.length){
				line_2.push(data.line_2);
			}
			if(data.line_3.length){
				line_2.push(data.line_3);
			}
			if(data.line_4.length){
				line_2.push(data.line_4);
			}

			/* clients love to disable the second line field then ask why part of the address is missing */
			if(address_line2){
				address_line2.value = line_2.join(', ');
			} else {
				address_line1.value += ', ' + line_2.join(', ');
			}

			const address_city = root.querySelector('#' + address_type + '_city');
			if(address_city){
				address_city.value = data.town_or_city;
			}

			const address_state = root.querySelector('#' + address_type + '_state');
			if(address_state){
				address_state.value = data.county;
			}

			const address_postcode = root.querySelector('#' + address_type + '_postcode');
			if(address_postcode){
				address_postcode.value = data.postcode;
			}
		
			getaddressio_show_fields(address_type);


		})
		.catch((err_detail) => {

			select.classList.remove('address__select--loading');
		
			getaddressio_show_fields(address_type);

		});
	} else {

		select.classList.remove('address__select--loading');
		
		getaddressio_show_fields(address_type);
	}
}

function getaddressio_manual(event){
	
	event.stopImmediatePropagation();
	
	window.getaddressio_globals.hide = false;
	clearTimeout(window.getaddressio_globals.timeout);
	const btn = event.target;
	const root = btn.parentNode;
	const address_type = root.id.replace(/([a-z]+)\_address\_search\_field/gi, '$1');
	getaddressio_show_fields(address_type);

}

function getaddressio_search(event){
	
	event.stopImmediatePropagation();
	
	window.getaddressio_globals.hide = false;
	clearTimeout(window.getaddressio_globals.timeout);
	
	const btn = event.target;
	const root = btn.parentNode;
	const address_type = root.id.replace(/([a-z]+)\_address\_search\_field/gi, '$1');
	const input = root.querySelector('.input-text');
	const url = wcgaio.ajax_url;
	const post_params = [];
	post_params.push('action=' + encodeURIComponent('wcgaio_address_search'));
	post_params.push('token=' + encodeURIComponent(wcgaio.search_token));
	post_params.push('search=' + encodeURIComponent(input.value));
	while(btn.childNodes.length){
		btn.firstChild.remove();
	}
	btn.append('Searching');
	btn.disabled = true;
		
	const old_err = root.querySelector('.address__error');
	if(old_err){
		old_err.remove();
	}
	
	if(input.value.length){
	
		fetch(url, {
			method: 'POST',
			mode: 'same-origin',
			cache: 'no-cache',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			redirect: 'follow',
			referrerPolicy: 'no-referrer',
			body: post_params.join('&')
		})
		.then((response) => {
			if(!response.ok){
				throw new Error(response.status);
			}
			return response.json();
		})
		.then((data) => {

			let select = root.querySelector('.address__select');

			if(!('suggestions' in data)){
				data = {"suggestions" : []};
			}

			if(data.suggestions.length){
				if(!select){
					select = document.createElement('select');
					select.className = 'address__select';
					select.addEventListener('change', getaddressio_select);
					root.append(select);
				}
				while(select.childNodes.length){
					select.firstChild.remove();
				}

				const default_option = document.createElement('option');
				default_option.value = '';
				default_option.append('Select your address');
				default_option.selected = true;
				default_option.disabled = true;
				select.append(default_option);

				data.suggestions.forEach((address_data) => {
					const option = document.createElement('option');
					option.value = address_data.id;
					option.append(address_data.address);
					select.append(option);
				});

				while(btn.childNodes.length){
					btn.firstChild.remove();
				}
				btn.append('Search');
				btn.disabled = false;

			} else {

				if(select){
					select.remove();
				}

				const err = document.createElement('div');
				err.className = 'address__error';
				err.append('Error: no addresses found. Please enter your address manually below');
				root.append(err);

				while(btn.childNodes.length){
					btn.firstChild.remove();
				}
				btn.append('Search');
				btn.disabled = false;
		
				getaddressio_show_fields(address_type);

			}
		
		})
		.catch((err_detail) => {

			const err = document.createElement('div');
			err.className = 'address__error';
			err.append('Error: unable to obtain full address details. Please enter your address manually below');
			root.append(err);

			while(btn.childNodes.length){
				btn.firstChild.remove();
			}
			btn.append('Search');
			btn.disabled = false;
		
			getaddressio_show_fields(address_type);

		});
			
	} else {

		while(btn.childNodes.length){
			btn.firstChild.remove();
		}
		btn.append('Search');
		btn.disabled = false;
		
		getaddressio_show_fields(address_type);
		
	}
}

function getaddressio_show_fields(address_type){
	if(window.getaddressio_globals.loaded){
		(($) => {
			$('#' + address_type + '_address_1_field').slideDown(200);
			$('#' + address_type + '_address_2_field').slideDown(200);
			$('#' + address_type + '_city_field').slideDown(200);
			$('#' + address_type + '_state_field').slideDown(200);
			$('#' + address_type + '_postcode_field').slideDown(200);
		})(jQuery);
	} else {
		getaddressio_show_node('#' + address_type + '_address_1_field');
		getaddressio_show_node('#' + address_type + '_address_2_field');
		getaddressio_show_node('#' + address_type + '_city_field');
		getaddressio_show_node('#' + address_type + '_state_field');
		getaddressio_show_node('#' + address_type + '_postcode_field');
	}
}

function getaddressio_show_node(selector){
	const nodes = document.querySelectorAll(selector);
	nodes.forEach((node) => {
		node.style.display = 'block';
	});
}

function getaddressio_hide_node(selector){
	const nodes = document.querySelectorAll(selector);
	nodes.forEach((node) => {
		node.style.display = 'none';
	});
}

function getaddressio_hide(){
	if(window.getaddressio_globals.hide){
		
		getaddressio_hide_node('#billing_address_1_field');
		getaddressio_hide_node('#billing_address_2_field');
		getaddressio_hide_node('#billing_city_field');
		getaddressio_hide_node('#billing_state_field');
		getaddressio_hide_node('#billing_postcode_field');
		getaddressio_hide_node('#shipping_address_1_field');
		getaddressio_hide_node('#shipping_address_2_field');
		getaddressio_hide_node('#shipping_city_field');
		getaddressio_hide_node('#shipping_state_field');
		getaddressio_hide_node('#shipping_postcode_field');
			
		window.getaddressio_globals.timeout = setTimeout(getaddressio_hide, 250);
	}
}

function getaddressio_load(){
	window.getaddressio_globals.loaded = true;
}

function getaddressio_init(){

	const searches = document.querySelectorAll('.address__search');
	searches.forEach((search) => {

		const btn = document.createElement('button');
		btn.className = 'address__button address__button--search';
		btn.append('Search');
		btn.type = 'button';
		btn.addEventListener('click', getaddressio_search);
		btn.addEventListener('tap', getaddressio_search);
		search.append(btn);

		if(wcgaio.show_manual_btn === 'true'){/* wp_localize script erroneously converts everything to a string */
			const btn_manual = document.createElement('button');
			btn_manual.className = 'address__button address__button--manual';
			btn_manual.append('Enter Address Manually');
			btn_manual.type = 'button';
			btn_manual.addEventListener('click', getaddressio_manual);
			btn_manual.addEventListener('tap', getaddressio_manual);
			search.append(btn_manual);
		}

	});
	
	getaddressio_hide();
	
}

(() => {
	
	window.getaddressio_globals = {
		'hide' : true,
		'timeout' : null,
		'loaded' : false
	};

	window.addEventListener('load', getaddressio_load);
	
	getaddressio_init();
	
})();
