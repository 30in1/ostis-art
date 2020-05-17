/**
 * Paint panel.
 */
cpu_set = [];
common_count = 0;
s = null;

Example.PaintPanel = function (containerId) {
    this.containerId = containerId;
};

Example.PaintPanel.prototype = {

    init: function () {
        s = this;
        this._initMarkup(this.containerId);
    },

    _initMarkup: function (containerId) {
        var container = $('#' + containerId);

        var self = this;
       container.append('<div class="sc-no-default-cmd">Агент подбора театра</div>');
               
		container.append('Режиссер:</br>');
		container.append('<input type="text" value="" id="cpu_producer" /></br>');
		container.append('Максимальное количество постановок:</br>');
		container.append('<input type="text" value="" id="max_flow_quantity" /></br>');
		container.append('Год постройки:</br>');
		container.append('<input type="text" value="" id="manufacture_year" /></br>');
		container.append('<button id="pick_up_cpus" type="button">Подобрать</button></br>');
		container.append('</br><table id="cpu_table" border="1"></table>');

		$('#pick_up_cpus').click(function () {
			cpu_set = [];
			common_count = 0;		
			self._searchElements('cpu_producer', 'nrel_producer');
                        setTimeout(self._searchElements, 1000, 'max_flow_quantity', 'nrel_max_flow_quantity');	
			setTimeout(self._searchElements, 2000, 'manufacture_year', 'nrel_manufacture_date');
			setTimeout(self._sort_cpu_set, 4000);
		});
    },


	_searchElements: function(element_id, name_of_node) {
		if (document.getElementById(element_id).value != "") {
			common_count++;
			var valueField = document.getElementById(element_id).value;
			SCWeb.core.Server.findIdentifiersSubStr(valueField, function(sc_node_addr) {
				var sc_node_addr_numb = 0;

                                if (sc_node_addr.sys.length != 0){
                                    sc_node_addr_numb = sc_node_addr.sys[0][0];
                                } else if (sc_node_addr.main.length != 0){
                                    sc_node_addr_numb = sc_node_addr.main[0][0];
                                } else if (sc_node_addr.common.length != 0){
                                    sc_node_addr_numb = sc_node_addr.common[0][0];
                                }
				SCWeb.core.Server.resolveScAddr([name_of_node],function(keynodes){
					var name_of_nrel_node_numb = keynodes[name_of_node];
					window.sctpClient.iterate_elements(SctpIteratorType.SCTP_ITERATOR_5A_A_F_A_F,[
						sc_type_node,
						sc_type_arc_common | sc_type_const,
						sc_node_addr_numb,
						sc_type_arc_pos_const_perm,
						name_of_nrel_node_numb]).done(function(elements){
							for (count = 0; count < elements.length; count++){
								window.scHelper.getIdentifier(elements[count][0],SCWeb.core.Server._current_language).done(function (cpu_name) {
									cpu_set.push(cpu_name);
								})
							}
						});
				});
			})
	};
},

	_sort_cpu_set: function () {
		var table = document.getElementById('cpu_table');
		table.innerHTML = "";
		var result_cpu_set = [];
		var control_count = 0;
		for (var count = 0; count < cpu_set.length; count++){
			control_count = 0;	
			for (var count1 = 0; count1 < cpu_set.length; count1++){
				if (cpu_set[count] == cpu_set[count1]) {
					control_count++;
				}
			}	
			if (control_count == common_count) {
				result_cpu_set.push(cpu_set[count])
			}
		}
		for (var count = 0; count < result_cpu_set.length; count++){
			for (var count1 = count+1; count1 < result_cpu_set.length; count1++){
				if (result_cpu_set[count] == result_cpu_set[count1]) {
					result_cpu_set.splice(count1, 1);
					count1--;
				}
			}
		}
		for (count = 0; count < result_cpu_set.length; count++) {
			table.innerHTML+='<tr><td>'+result_cpu_set[count]+'</td></tr>';
		}
	},

};
