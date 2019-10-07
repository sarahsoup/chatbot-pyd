
const animDelay = 500;
const defaultDelay = 0;

d3.csv('./assets/script_pyd.csv').then(data => {

    const rounds = d3.nest()
        .key(d => d.round)
        .entries(data);

    const container = d3.select('.container');

    rounds.forEach((round,i) => {
        // append erica div
        const ericaIndex = round.values.map(d => d.name).indexOf('erica');
        const ericaText = round.values[ericaIndex].option;
        const ericaRow = container.append('div')
            .attr('class',(round.key == '1') ? `row round round-${round.key}` : `row round round-${round.key} hidden`)
            .attr('id',`round-${round.key}-erica`);
        ericaRow.append('div')
            .attr('class','col-2 col-lg-1 offset-lg-2')
            .append('img')
            .attr('class',(i == 0) ? 'erica-square' : 'erica-square opacity-0')
            .attr('src','./assets/erica_square.png');
        ericaRow.append('div')
            .attr('class','col-8 col-lg-6')
            .append('div')
            .attr('class','erica')
            .append('div')
            .attr('class',(i == 0) ? 'bubble-erica' : 'bubble-erica opacity-0')
            .append('p')
            .html(ericaText.substring(1, ericaText.length-1));

        // append user div
        const user = container.append('div')
            .attr('class',(round.key == '1') ? `row round round-${round.key}` : `row round round-${round.key} hidden`)
            .attr('id',`round-${round.key}-user`)
            .append('div')
            .attr('class','col-12 offset-md-2 col-md-8 offset-lg-3 col-lg-6')
            .append('div')
            .attr('class','user');
        if(i < rounds.length-1){
            user.append('h2')
                .attr('class',(i == 0) ? 'narrator' : 'narrator opacity-0')
                .html('How would you reply?');
        }else{
            user.append('h2')
                .attr('class','narrator opacity-0')
                .html(round.values[0].response.substring(1,round.values[0].response.length-1));
        }
        user.selectAll('.response')
            .data(round.values.filter(d => d.name != 'erica'))
            .enter()
            .append('h2')
            .attr('class','narrator hidden opacity-0')
            .attr('id',d => `response-${d.name}`)
            .html(d => d.response.substring(1,d.response.length-1));
        user.selectAll('.option')
            .data(round.values.filter(d => d.name != 'erica'))
            .enter()
            .append('div')
            .attr('class',(i == 0) ? 'option' : 'option opacity-0')
            .attr('id',d => `option-${d.name}`)
            .on('click',d => {
                if(d.name == 'good'){
                    selectGood(+round.key);
                }else{
                    selectBad(+round.key,+d.name.substring(d.name.length-1));
                }
            })
            .append('p')
            .html(d => d.option.substring(1,d.option.length-1));
        
    })
})

function selectBad(round,option){
    const user = d3.select(`#round-${round}-user`).select('.user');

    // translate to speech bubble + animate
    // replace if other bad option was previously chosen
    user.selectAll('div')  
        .each(function(d,i){
            const order = d3.select(this).style('order');
            if(order != '0'){
                d3.select(this).classed('hidden',true);
            }else if(this.id == `option-bad${option}`){
                d3.select(this)
                    .classed('option',false)
                    .classed('bubble-user',true)
                    .classed('slide-in-fwd-bottom',true)
                    .style('order',`-${i+1}`);
            }
        })

    // give narrator response
    user.selectAll('.narrator')
        .classed('hidden',function(){
            return (this.id == `response-bad${option}`) ? false : true;
        })

    // animate narrator response
    setTimeout(function(){
        user.select(`#response-bad${option}`).classed('opacity-in',true);
    },defaultDelay + animDelay);

    // animate remaining options
    user.selectAll('.option')
        .style('opacity',0)
        .classed('opacity-in',false);

    user.selectAll('.option').each((d,i) => {
        setTimeout(function(){
            user.selectAll('.option')
                .filter((d,index) => i == index)
                .classed('opacity-in',true);
        },defaultDelay + (animDelay * (2 + i/2)));
    })

}

function selectGood(round){
    const user = d3.select(`#round-${round}-user`).select('.user');

    // translate to speech bubble
    // replace if bad option was previously chosen
    user.selectAll('div')
        .each(function(d,i){
            if(this.id == 'option-good'){
                d3.select(this)
                    .classed('option',false)
                    .classed('bubble-user',true)
                    .classed('slide-in-fwd-bottom',true)
                    .style('order',`-${i+1}`);
            }else{
                d3.select(this).classed('hidden',true);
            }
        })

    // give narrator response
    user.selectAll('.narrator')
        .classed('hidden',function(){
            return (this.id == 'response-good') ? false : true;
        });

    // animate narrator response
    setTimeout(function(){
        user.select(`#response-good`).classed('opacity-in',true);
    },defaultDelay + animDelay);

    // show next round + animate
    const nextRound = d3.selectAll(`.round-${round+1}`);
    nextRound.classed('hidden',false);

    setTimeout(function(){
        nextRound.select('.erica-square').classed('slide-in-fwd-bottom',true);
        nextRound.select('.bubble-erica').classed('slide-in-fwd-bottom',true);
    },defaultDelay + animDelay*2);

    setTimeout(function(){
        nextRound.select('.narrator').classed('opacity-in',true);
    },defaultDelay + animDelay*3);

    nextRound.selectAll('.option').each((d,i) => {
        setTimeout(function(){
            nextRound.selectAll('.option')
                .filter((d,index) => i == index)
                .classed('opacity-in',true);
        },defaultDelay + animDelay * (4 + i/2));
    })

}