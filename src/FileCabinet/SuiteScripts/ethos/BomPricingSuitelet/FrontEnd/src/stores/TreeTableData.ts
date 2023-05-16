export const NodeService = {

    getTreeTableNodesData() {

        return [
            {
                key: '0',
                data: {
                    itemid: '1301',
                    itempart: 'M320, Packaging',
                    itemdescription: 'M320, ASSY ON SITE',
                    averagecost: '--',
                    qty: 1,
                    level: 0,
                },
                children: [
                    {
                        key: '0-0',
                        data: {
                            item: '1157',
                            itempart: '105921',
                            itemdescription: 'Cradle, M320 Assy',
                            averagecost: '$85.00',
                            qty: 1,
                            level: 1,
                        },
                    },
                    {
                        key: '0-1',
                        data: {
                            item: '3447',
                            itempart: '200248',
                            itemdescription: 'PAD, AOS PACKOUT',
                            averagecost: '$18.46',
                            qty: 1,
                            level: 1,
                        },
                    },

                ],

                // key: '1',


            }
        ]

    },

    getTreeTableNodes() {
        return Promise.resolve(this.getTreeTableNodesData());
    },

};
