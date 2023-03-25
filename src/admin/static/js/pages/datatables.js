$(document).ready(() => {
    $('#pages-datatable').DataTable({
        aoColumnDefs: [
            {
                bSortable: false,
                aTargets: [-1]
            }
        ],
        stateSave: true,
        searchDelay: 700,
        aaSorting: [[0, 'desc']],
        processing: true,
        serverSide: true,
        ajax: {
            url: '/pages/list',
            data: {}
        },
        initComplete: (settings, json) => {
            $('.tableLoader').css('display', 'none');
        },
        language: {
            paginate: {
                previous: '<i class="mdi mdi-chevron-left">',
                next: '<i class="mdi mdi-chevron-right">'
            }
        },
        drawCallback: () => {
            $('.dataTables_paginate > .pagination').addClass('pagination-rounded');
        }
    });
    $('#restaurant-datatable').DataTable({
        aoColumnDefs: [
            {
                bSortable: false,
                aTargets: [-1]
            }
        ],
        stateSave: true,
        searchDelay: 700,
        aaSorting: [[0, 'desc']],
        processing: true,
        serverSide: true,
        ajax: {
            url: '/restaurant/list',
            data: {}
        },
        initComplete: (settings, json) => {
            $('.tableLoader').css('display', 'none');
        },
        language: {
            paginate: {
                previous: '<i class="mdi mdi-chevron-left">',
                next: '<i class="mdi mdi-chevron-right">'
            }
        },
        drawCallback: () => {
            $('.dataTables_paginate > .pagination').addClass('pagination-rounded');
        }
    });
    //post page
    $('#post-datatable').DataTable({
        aoColumnDefs: [
            {
                bSortable: false,
                aTargets: [-1]
            }
        ],
        stateSave: true,
        searchDelay: 700,
        aaSorting: [[0, 'desc']],
        processing: true,
        serverSide: true,
        ajax: {
            url: '/posts/list',
            data: {}
        },
        initComplete: (settings, json) => {
            $('.tableLoader').css('display', 'none');
        },
        language: {
            paginate: {
                previous: '<i class="mdi mdi-chevron-left">',
                next: '<i class="mdi mdi-chevron-right">'
            }
        },
        drawCallback: () => {
            $('.dataTables_paginate > .pagination').addClass('pagination-rounded');
        }
    });
    //swap type page
    $('#swap-datatable').DataTable({
        aoColumnDefs: [
            {
                bSortable: false,
                aTargets: [-1]
            }
        ],
        stateSave: true,
        searchDelay: 700,
        aaSorting: [[0, 'desc']],
        processing: true,
        serverSide: true,
        ajax: {
            url: '/swaptypes/list',
            data: {}
        },
        initComplete: (settings, json) => {
            $('.tableLoader').css('display', 'none');
        },
        language: {
            paginate: {
                previous: '<i class="mdi mdi-chevron-left">',
                next: '<i class="mdi mdi-chevron-right">'
            }
        },
        drawCallback: () => {
            $('.dataTables_paginate > .pagination').addClass('pagination-rounded');
        }
    });
    
    $('#users-datatable').DataTable({
        aoColumnDefs: [
            {
                bSortable: false,
                aTargets: [-1, -4, -5]
            }
        ],
        stateSave: true,
        searchDelay: 700,
        aaSorting: [[0, 'desc']],
        processing: true,
        serverSide: true,
        ajax: {
            url: '/users/list',
            data: {}
        },
        initComplete: (settings, json) => {
            $('.tableLoader').css('display', 'none');
        },
        language: {
            paginate: {
                previous: '<i class="mdi mdi-chevron-left">',
                next: '<i class="mdi mdi-chevron-right">'
            }
        },
        drawCallback: () => {
            $('.dataTables_paginate > .pagination').addClass('pagination-rounded');
        }
    });

    $('#subscriptions-datatable').DataTable({
        aoColumnDefs: [

            // {
            //     // bSortable: false,
            //     // aTargets: [-1, -4, -5]
            //     // "defaultContent": "-",
            //     "targets": "_all"
            // }
            {
                // bSortable: false,
                // aTargets: [-1, -4, -5],
                "defaultContent": " ",
                "targets": "_all"
            }
        ],
        stateSave: true,
        searchDelay: 700,
        aaSorting: [[0, 'desc']],
        processing: true,
        serverSide: true,
        ajax: {
            url: '/payments/list',
            data: {}
        },
        initComplete: (settings, json) => {
            $('.tableLoader').css('display', 'none');
        },
        language: {
            paginate: {
                previous: '<i class="mdi mdi-chevron-left">',
                next: '<i class="mdi mdi-chevron-right">'
            }
        },
        drawCallback: () => {
            $('.dataTables_paginate > .pagination').addClass('pagination-rounded');
        }
    });


    $('#category-datatable').DataTable({
        aoColumnDefs: [
            {
                bSortable: false,
                aTargets: [-1]
            }
        ],
        stateSave: true,
        searchDelay: 700,
        aaSorting: [[0, 'desc']],
        processing: true,
        serverSide: true,
        ajax: {
            url: '/categories/list',
            data: {}
        },
        initComplete: (settings, json) => {
            $('.tableLoader').css('display', 'none');
        },
        language: {
            paginate: {
                previous: '<i class="mdi mdi-chevron-left">',
                next: '<i class="mdi mdi-chevron-right">'
            }
        },
        drawCallback: () => {
            $('.dataTables_paginate > .pagination').addClass('pagination-rounded');
        }
    });


    $('#ads-datatable').DataTable({
        aoColumnDefs: [
            {
                bSortable: false,
                aTargets: [-1]
            }
        ],
        stateSave: true,
        searchDelay: 700,
        aaSorting: [[0, 'desc']],
        processing: true,
        serverSide: true,
        ajax: {
            url: '/ads/list',
            data: {}
        },
        initComplete: (settings, json) => {
            $('.tableLoader').css('display', 'none');
        },
        language: {
            paginate: {
                previous: '<i class="mdi mdi-chevron-left">',
                next: '<i class="mdi mdi-chevron-right">'
            }
        },
        drawCallback: () => {
            $('.dataTables_paginate > .pagination').addClass('pagination-rounded');
        }
    });
    


    $('#categories-datatable').DataTable({
        aoColumnDefs: [
            {
                bSortable: false,
                aTargets: [-3, -4]
            }
        ],
        stateSave: true,
        searchDelay: 700,
        aaSorting: [[0, 'desc']],
        processing: true,
        serverSide: true,
        ajax: {
            url: '/categories/list',
            data: {}
        },
        initComplete: (settings, json) => {
            $('.tableLoader').css('display', 'none');
        },
        language: {
            paginate: {
                previous: '<i class="mdi mdi-chevron-left">',
                next: '<i class="mdi mdi-chevron-right">'
            }
        },
        drawCallback: () => {
            $('.dataTables_paginate > .pagination').addClass('pagination-rounded');
        }
    });

    $('#live-datatable').DataTable({
        aoColumnDefs: [
            {
                bSortable: false,
                aTargets: [-1]
            }
        ],
        stateSave: true,
        searchDelay: 700,
        aaSorting: [[0, 'desc']],
        processing: true,
        serverSide: true,
        ajax: {
            url: '/videos/list',
            data: {}
        },
        initComplete: (settings, json) => {
            $('.tableLoader').css('display', 'none');
        },
        language: {
            paginate: {
                previous: '<i class="mdi mdi-chevron-left">',
                next: '<i class="mdi mdi-chevron-right">'
            }
        },
        drawCallback: () => {
            $('.dataTables_paginate > .pagination').addClass('pagination-rounded');
        }
    });

    $('#store-datatable').DataTable({
        aoColumnDefs: [
            {
                bSortable: false,
                aTargets: [-1,-2]
            }
        ],
        stateSave: true,
        searchDelay: 700,
        aaSorting: [[0, 'desc']],
        processing: true,
        serverSide: true,
        ajax: {
            url: '/stores/list',
            data: {}
        },
        initComplete: (settings, json) => {
            $('.tableLoader').css('display', 'none');
        },
        language: {
            paginate: {
                previous: '<i class="mdi mdi-chevron-left">',
                next: '<i class="mdi mdi-chevron-right">'
            }
        },
        drawCallback: () => {
            $('.dataTables_paginate > .pagination').addClass('pagination-rounded');
        }
    });

    $('#leads-datatable').DataTable({
        aoColumnDefs: [
            {
                bSortable: false,
                aTargets: [0,-1,-2]
            }
        ],
        stateSave: true,
        searchDelay: 700,
        aaSorting: [[0, 'desc']],
        processing: true,
        serverSide: true,
        ajax: {
            url: '/leads/list',
            data: {}
        },
        initComplete: (settings, json) => {
            $('.tableLoader').css('display', 'none');
        },
        language: {
            paginate: {
                previous: '<i class="mdi mdi-chevron-left">',
                next: '<i class="mdi mdi-chevron-right">'
            }
        },
        drawCallback: () => {
            $('.dataTables_paginate > .pagination').addClass('pagination-rounded');
        }
    });

    
    $('#orders-datatable').DataTable({
        aoColumnDefs: [{
            bSortable: false,
            aTargets: [0,-1,-2]
        }],
        stateSave: true,
        searchDelay: 700,
        aaSorting: [[0, 'desc']],
        processing: true,
        serverSide: true,
        ajax: {
            url: '/orders/list',
            data: {}
        },
        initComplete: (settings, json) => {
            $('.tableLoader').css('display', 'none');
        },
        language: {
            paginate: {
                previous: '<i class="mdi mdi-chevron-left">',
                next: '<i class="mdi mdi-chevron-right">'
            }
        },
        drawCallback: () => {
            $('.dataTables_paginate > .pagination').addClass('pagination-rounded');
        }
    });

    $('#jobpositions-datatable').DataTable({
        aoColumnDefs: [{
            bSortable: false,
            aTargets: [0,-1,-2]
        }],
        stateSave: true,
        searchDelay: 700,
        aaSorting: [[0, 'desc']],
        processing: true,
        serverSide: true,
        ajax: {
            url: '/jobpositions/list',
            data: {}
        },
        initComplete: (settings, json) => {
            $('.tableLoader').css('display', 'none');
        },
        language: {
            paginate: {
                previous: '<i class="mdi mdi-chevron-left">',
                next: '<i class="mdi mdi-chevron-right">'
            }
        },
        drawCallback: () => {
            $('.dataTables_paginate > .pagination').addClass('pagination-rounded');
        }
    });
    
    $('#jobposition-applied-datatable').DataTable({
        aoColumnDefs: [
            {
                bSortable: false,
                aTargets: [0,1,2]
            }
        ],
        // bPaginate: false,
        bLengthChange: false,
        bAutoWidth: false,
        bInfo: false,
        stateSave: true,
        searchDelay: 700,
        //aaSorting: [[0, 'desc']],
        processing: true,
        serverSide: true,
        ajax: {
            url: '/concierges/applied-list/'+$('#jobposition_id').val(),
            data: {}
        },
        initComplete: (settings, json) => {
            $('.tableLoader').css('display', 'none');
        },
        language: {
            paginate: {
                previous: '<i class="mdi mdi-chevron-left">',
                next: '<i class="mdi mdi-chevron-right">'
            }
        },
        drawCallback: () => {
            $('.dataTables_paginate > .pagination').addClass('pagination-rounded');
        }
    });
});