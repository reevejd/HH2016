var request = require('request'); // for making API calls
var bodyParser = require('body-parser');
var pg = require('pg');
var FormData = require('form-data');
var db = require('./modules/database.js');

// port = process.env.PORT for deploying on cloud host (need this for heroku anyway, 8080 for local testing

// setting up express 4 server & socket.io
var express = require('express');
var app = express();
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());

var server = require('http').createServer(app);

var port = process.env.PORT || 8080;
server.listen(port, function() {
    console.log('Server running on :' + port);
})

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// static files are stored in the public folder
app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res) {
  res.render('index');
});

//twitter done url
app.get('/ttam', function(req, res) {
  res.render('ttam');
});

var accessToken;
var profileID;
app.get('/genometoken', function(req, res) {
    var accessToken;
    console.log(req.query.code);
    res.render('index');

    /*request.post('https://api.23andme.com/token/', {
      form: {
        client_id : 'be256e46c1e76dd5e8c76197f9168bed' ,
        client_secret : 'fdc2dceabe85b0336e7bc99b5eb6a4c3' ,
        grant_type: 'authorization_code',
        code : req.query.code ,
        redirect_uri : 'http://localhost:8080/genometoken',
        scope :'genomes basic'
      },
      json: true
    }, function (error, response, body) {
      // assert.equal(typeof body, 'object')
      if(error) {
          console.log(error);
      } else {
          console.log(response.statusCode, body);
          console.log(body.access_token);
          accessToken = body.access_token;
          //getting the user id
          /*request({
              url: 'https://api.23andme.com/1/user/', //URL to hit
              method: 'GET', //Specify the method
              headers: { //We can define headers too
                  'Authorization': 'Bearer' + ' ' + accessToken
              }
          }, function(error, response, body){
              if(error) {
                  console.log(error);
              } else {
                  console.log(response.statusCode, body);
                  body = JSON.parse(body);
                  console.log(body.profiles[0].id);
                  profileID = body.profiles[0].id;
              }
          });
        }
    });*/
});

var connect = require('connect')
var bodyParser = require('body-parser');
/** bodyParser.urlencoded(options)
 * Parses the text as URL encoded data (which is how browsers tend to send form data from regular forms set to POST)
 * and exposes the resulting object (containing the keys and values) on req.body
 */
app.use(bodyParser.urlencoded({
    extended: true
}));

/**bodyParser.json(options)
 * Parses the text as JSON and exposes the resulting object on req.body.
 */
app.use(bodyParser.json());

var globalTwitterHandle;
app.post("/", function (req, res) {
    console.log(req.body.twitter_handle)
    globalTwitterHandle = req.body.twitter_handle;
    console.log(globalTwitterHandle);
});



function Twitter_API(twitter_handle_input){
//Get twitter information
var Twitter = require('twitter');

var twitter_consumer_key = 'Kb4hqjLTn8vel2IAkXATRRvew'
var twitter_consumer_secret = 'bnQte5n2L8vhuvntC8mNznMWNsyGZK5D53WkZ6XQmEmfUHQL27'
var twitter_access_token = '704689827896119296-cslSvWwwug7Glq9ZDN7U28yAU8kP3qF'
var twitter_access_secret = 'viA2ssK0k7r3i4wsmyyqIbmIlP2rlprAVGfpjs7g3EKFB'

//get access from twitter app
var client = new Twitter({
  consumer_key: twitter_consumer_key,
  consumer_secret: twitter_consumer_secret,
  access_token_key: twitter_access_token,
  access_token_secret: twitter_access_secret
});

var text_tweets = '' //body of text to send to watson API
//var input_user_name = '@paultaufalele' //Store the user input twitter handle
var input_screen_name = twitter_handle_input
var number_of_tweets = 200 //Set number of tweets attempting to pull
var params = {screen_name: input_screen_name, count : number_of_tweets, include_rts: false};
client.get('statuses/user_timeline', params, function(error, tweets, response) {
  if(error){
    console.log(error)
  }// end of if statement
  else {
    for(var i = 0; i < tweets.length; i++) {
      if(tweets[i].lang == 'en'){
        text_tweets += tweets[i].text + ' '
      }// end if statment
    }//end for loop
    text_tweets = text_tweets.replace(/[^\w\d\s]/g, "") //filter special char
    //console.log(text_tweets)
    Watson_API(text_tweets)
  }//end of else statement
});//end of glient.get statement
}//end of function

function Watson_API(twitter_text_input){
//initialize and authenticate watson PI
var PersonalityInsightsV3 = require('watson-developer-cloud/personality-insights/v3');
var watson = require('watson-developer-cloud/personality-insights/v3');
var personality_insights = new PersonalityInsightsV3({
  username: 'd46914ad-553b-4f92-a85a-d3f1f7ed1379',
  password: '87htHzhora8H',
  version_date: '2016-10-20'
});
//var watsonString = "Well, thank you very much, Jim, for this opportunity. I want to thank Governor Romney and the University of Denver for your hospitality. There are a lot of points I want to make tonight, but the most important one is that 20 years ago I became the luckiest man on Earth because Michelle Obama agreed to marry me. And so I just want to wish, Sweetie, you happy anniversary and let you know that a year from now we will not be celebrating it in front of 40 million people. You know, four years ago we went through the worst financial crisis since the Great Depression. Millions of jobs were lost, the auto industry was on the brink of collapse. The financial system had frozen up. And because of the resilience and the determination of the American people, we've begun to fight our way back. Over the last 30 months, we've seen 5 million jobs in the private sector created. The auto industry has come roaring back. And housing has begun to rise. But we all know that we've still got a lot of work to do. And so the question here tonight is not where we've been, but where we're going. Governor Romney has a perspective that says if we cut taxes, skewed towards the wealthy, and roll back regulations, that we'll be better off. I've got a different view. I think we've got to invest in education and training. I think it's important for us to develop new sources of energy here in America, that we change our tax code to make sure that we're helping small businesses and companies that are investing here in the United States, that we take some of the money that we're saving as we wind down two wars to rebuild America and that we reduce our deficit in a balanced way that allows us to make these critical investments. Now, it ultimately is going to be up to the voters — to you — which path we should take. Are we going to double on top-down economic policies that helped to get us into this mess or do we embrace a new economic patriotism that says America does best when the middle class does best? And I'm looking forward to having that debate. Well, let me talk specifically about what I think we need to do. First, we've got to improve our education system and we've made enormous progress drawing on ideas both from Democrats and Republicans that are already starting to show gains in some of the toughest to deal with schools. We've got a program called Race to the Top that has prompted reforms in 46 states around the country, raising standards, improving how we train teachers. So now I want to hire another 100,000 new math and science teachers, and create 2 million more slots in our community colleges so that people can get trained for the jobs that are out there right now. And I want to make sure that we keep tuition low for our young people. When it comes to our tax code, Governor Romney and I both agree that our corporate tax rate is too high, so I want to lower it, particularly for manufacturing, taking it down to 25 percent. But I also want to close those loopholes that are giving incentives for companies that are shipping jobs overseas. I want to provide tax breaks for companies that are investing here in the United States. On energy, Governor Romney and I, we both agree that we've got to boost American energy production, and oil and natural gas production are higher than they've been in years. But I also believe that we've got to look at the energy sources of the future, like wind and solar and biofuels, and make those investments. So all of this is possible. Now, in order for us to do it, we do have to close our deficit, and one of the things I'm sure we'll be discussing tonight is, how do we deal with our tax code? And how do we make sure that we are reducing spending in a responsible way, but also, how do we have enough revenue to make those investments? And this is where there's a difference, because Governor Romney's central economic plan calls for a $5 trillion tax cut — on top of the extension of the Bush tax cuts — that's another trillion dollars — and $2 trillion in additional military spending that the military hasn't asked for. That's $8 trillion. How we pay for that, reduce the deficit, and make the investments that we need to make, without dumping those costs onto middle-class Americans, I think is one of the central questions of this campaign. When you add up all the loopholes and deductions that upper-income individuals can — are currently taking advantage of, you take those all away, you don't come close to paying for $5 trillion in tax cuts and $2 trillion in additional military spending. OBAMA: And that's why independent studies looking at this said the only way to meet Governor Romney's pledge of not reducing the deficit or -- or — or not adding to the deficit is by burdening middle-class families. The average middle-class family with children would pay about $2,000 more. Now, that's not my analysis. That's the analysis of economists who have looked at this. And — and that kind of top — top-down economics, where folks at the top are doing well, so the average person making $3 million is getting a $250,000 tax break, while middle-class families are burdened further, that's not what I believe is a recipe for economic growth. Well, for 18 months he's been running on this tax plan. And now, five weeks before the election, he's saying that his big, bold idea is, Never mind. And the fact is that if you are lowering the rates the way you described, Governor, then it is not possible to come up with enough deductions and loopholes that only affect high-income individuals to avoid either raising the deficit or burdening the middle class. It's — it's math. It's arithmetic. Now, Governor Romney and I do share a deep interest in encouraging small-business growth. So at the same time that my tax plan has already lowered taxes for 98 percent of families, I also lowered taxes for small businesses 18 times. And what I want to do is continue the tax rates — the tax cuts that we put into place for small businesses and families. But I have said that for incomes over $250,000 a year, that we should go back to the rates that we had when Bill Clinton was president, when we created 23 million new jobs, went from deficit to surplus, and created a whole lot of millionaires to boot. And the reason this is important is because by doing that, we cannot only reduce the deficit, we cannot only encourage job growth through small businesses, but we're also able to make the investments that are necessary in education or in energy. And we do have a difference, though, when it comes to definitions of small business. Under — under my plan, 97 percent of small businesses would not see their income taxes go up. Governor Romney says, well, those top 3 percent, they're the job creators, they'd be burdened. But under Governor Romney's definition, there are a whole bunch of millionaires and billionaires who are small businesses. Donald Trump is a small business. Now, I know Donald Trump doesn't like to think of himself as small anything, but — but that's how you define small businesses if you're getting business income. And that kind of approach, I believe, will not grow our economy, because the only way to pay for it without either burdening the middle class or blowing up our deficit is to make drastic cuts in things like education, making sure that we are continuing to invest in basic science and research, all the things that are helping America grow. And I think that would be a mistake. Jim, I — you may want to move onto another topic, but I — I would just say this to the American people. If you believe that we can cut taxes by $5 trillion and add $2 trillion in additional spending that the military is not asking for, $7 trillion — just to give you a sense, over 10 years, that's more than our entire defense budget — and you think that by closing loopholes and deductions for the well-to-do, somehow you will not end up picking up the tab, then Governor Romney's plan may work for you. But I think math, common sense, and our history shows us that's not a recipe for job growth. Look, we've tried this. We've tried both approaches. The approach that Governor Romney's talking about is the same sales pitch that was made in 2001 and 2003, and we ended up with the slowest job growth in 50 years, we ended up moving from surplus to deficits, and it all culminated in the worst financial crisis since the Great Depression. Bill Clinton tried the approach that I'm talking about. We created 23 million new jobs. We went from deficit to surplus. And businesses did very well. So, in some ways, we've got some data on which approach is more likely to create jobs and opportunity for Americans and I believe that the economy works best when middle-class families are getting tax breaks so that they've got some money in their pockets, and those of us who have done extraordinarily well because of this magnificent country that we live in, that we can afford to do a little bit more to make sure we're not blowing up the deficit. I like it. When I walked into the Oval Office, I had more than a trillion-dollar deficit greeting me. And we know where it came from: two wars that were paid for on a credit card; two tax cuts that were not paid for; and a whole bunch of programs that were not paid for; and then a massive economic crisis. And despite that, what we've said is, yes, we had to take some initial emergency measures to make sure we didn't slip into a Great Depression, but what we've also said is, let's make sure that we are cutting out those things that are not helping us grow. So 77 government programs, everything from aircrafts that the Air Force had ordered but weren't working very well, 1 8 government —18 government programs for education that were well- intentioned, not weren't helping kids learn, we went after medical fraud in Medicare and Medicaid very aggressively, more aggressively than ever before, and have saved tens of billions of dollars, $50 billion of waste taken out of the system. And I worked with Democrats and Republicans to cut a trillion dollars out of our discretionary domestic budget. That's the largest cut in the discretionary domestic budget since Dwight Eisenhower. Now, we all know that we've got to do more. And so I've put forward a specific $4 trillion deficit reduction plan. It's on a website. You can look at all the numbers, what cuts we make and what revenue we raise. And the way we do it is $2.50 for every cut, we ask for $1 of additional revenue, paid for, as I indicated earlier, by asking those of us who have done very well in this country to contribute a little bit more to reduce the deficit. Governor Romney earlier mentioned the Bowles-Simpson commission. Well, that's how the commission — bipartisan commission that talked about how we should move forward suggested we have to do it, in a balanced way with some revenue and some spending cuts. And this is a major difference that Governor Romney and I have. Let — let me just finish their point, because you're looking for contrast. You know, when Governor Romney stood on a stage with other Republican candidates for the nomination and he was asked, would you take $10 of spending cuts for just $1 of revenue? And he said no. Now, if you take such an unbalanced approach, then that means you are going to be gutting our investments in schools and education. It means that Governor Romney... ... talked about Medicaid and how we could send it back to the states, but effectively this means a 30 percent cut in the primary program we help for seniors who are in nursing homes, for kids who are with disabilities. And — and that is not a right strategy for us to move forward. Sorry. That's what we've done, made some adjustments to it, and we're putting it forward before Congress right now, a $4 trillion plan... Well, we've had this discussion before. There has to be revenue in addition to cuts. Now, Governor Romney has ruled out revenue. He's ruled out revenue. If — if we're serious, we've got to take a balanced, responsible approach. And by the way, this is not just when it comes to individual taxes. Let's talk about corporate taxes. Now, I've identified areas where we can, right away, make a change that I believe would actually help the economy. The oil industry gets $4 billion a year in corporate welfare. Basically, they get deductions that those small businesses that Governor Romney refers to, they don't get. Now, does anybody think that ExxonMobil needs some extra money, when they're making money every time you go to the pump? Why wouldn't we want to eliminate that? Why wouldn't we eliminate tax breaks for corporate jets? My attitude is, if you got a corporate jet, you can probably afford to pay full freight, not get a special break for it. When it comes to corporate taxes, Governor Romney has said he wants to, in a revenue neutral way, close loopholes, deductions — he hasn't identified which ones they are -- but that thereby bring down the corporate rate. Well, I want to do the same thing, but I've actually identified how we can do that. And part of the way to do it is to not give tax breaks to companies that are shipping jobs overseas. Right now, you can actually take a deduction for moving a plant overseas. I think most Americans would say that doesn't make sense. And all that raises revenue. And so if we take a balanced approach, what that then allows us to do is also to help young people, the way we already have during my administration, make sure that they can afford to go to college. It means that the teacher that I met in Las Vegas, a wonderful young lady, who describes to me — she's got 42 kids in her class. The first two weeks she's got them, some of them sitting on the floor until finally they get reassigned. They're using text books that are 10 years old. That is not a recipe for growth. That's not how America was built. And so budgets reflect choices. Ultimately, we're going to have to make some decisions. And if we're asking for no revenue, then that means that we've got to get rid of a whole bunch of stuff. And the magnitude of the tax cuts that you're talking about, Governor, would end up resulting in severe hardship for people, but more importantly, would not help us grow. As I indicated before, when you talk about shifting Medicaid to states, we're talking about potentially a 30 — a 30 percent cut in Medicaid over time. Now, you know, that may not seem like a big deal when it just is, you know, numbers on a sheet of paper, but if we're talking about a family who's got an autistic kid and is depending on that Medicaid, that's a big problem. And governors are creative. There's no doubt about it. But they're not creative enough to make up for 30 percent of revenue on something like Medicaid. What ends up happening is some people end up not getting help. It's time to end it. OK. You know, I suspect that, on Social Security, we've got a somewhat similar position. Social Security is structurally sound. It's going to have to be tweaked the way it was by Ronald Reagan and Speaker — Democratic Speaker Tip O'Neill. But it is — the basic structure is sound. But — but I want to talk about the values behind Social Security and Medicare, and then talk about Medicare, because that's the big driver of our deficits right now. You know, my grandmother — some of you know — helped to raise me. My grandparents did. My grandfather died a while back. My grandmother died three days before I was elected president. And she was fiercely independent. She worked her way up, only had a high school education, started as a secretary, ended up being the vice president of a local bank. And she ended up living alone by choice. And the reason she could be independent was because of Social Security and Medicare. She had worked all her life, put in this money, and understood that there was a basic guarantee, a floor under which she could not go. And that's the perspective I bring when I think about what's called entitlements. You know, the name itself implies some sense of dependency on the part of these folks. These are folks who've worked hard, like my grandmother, and there are millions of people out there who are counting on this. So my approach is to say, how do we strengthen the system over the long term? And in Medicare, what we did was we said, we are going to have to bring down the costs if we're going to deal with our long-term deficits, but to do that, let's look where some of the money's going. $716 billion we were able to save from the Medicare program by no longer overpaying insurance companies by making sure that we weren't overpaying providers. And using that money, we were actually able to lower prescription drug costs for seniors by an average of $600, and we were also able to make a -- make a significant dent in providing them the kind of preventive care that will ultimately save money through the — throughout the system. So the way for us to deal with Medicare in particular is to lower health care costs. When it comes to Social Security, as I said, you don't need a major structural change in order to make sure that Social Security is there for the future. First of all, I think it's important for Governor Romney to present this plan that he says will only affect folks in the future. And the essence of the plan is that you would turn Medicare into a voucher program. It's called premium support, but it's understood to be a voucher program. His running mate... I don't. And let me explain why. I understand. For — so if you're — if you're 54 or 55, you might want to listen 'cause this - - this will affect you. The idea, which was originally presented by Congressman Ryan, your running mate, is that we would give a voucher to seniors and they could go out in the private marketplace and buy their own health insurance. The problem is that because the voucher wouldn't necessarily keep up with health care inflation, it was estimated that this would cost the average senior about $6,000 a year. Now, in fairness, what Governor Romney has now said is he'll maintain traditional Medicare alongside it. But there's still a problem, because what happens is, those insurance companies are pretty clever at figuring out who are the younger and healthier seniors. They recruit them, leaving the older, sicker seniors in Medicare. And every health care economist that looks at it says, over time, what'll happen is the traditional Medicare system will collapse. And then what you've got is folks like my grandmother at the mercy of the private insurance system precisely at the time when they are most in need of decent health care. So, I don't think vouchers are the right way to go. And this is not my own — only my opinion. AARP thinks that the — the savings that we obtained from Medicare bolster the system, lengthen the Medicare trust fund by eight years. Benefits were not affected at all. And ironically, if you repeal Obamacare, and I have become fond of this term, Obamacare, if you repeal it, what happens is those seniors right away are going to be paying $600 more in prescription care. They're now going to have to be paying copays for basic checkups that can keep them healthier. And the primary beneficiary of that repeal are insurance companies that are estimated to gain billions of dollars back when they aren't making seniors any healthier. And I don't think that's the right approach when it comes to making sure that Medicare is stronger over the long term. Jim, if I — if I can just respond very quickly, first of all, every study has shown that Medicare has lower administrative costs than private insurance does, which is why seniors are generally pretty happy with it. And private insurers have to make a profit. Nothing wrong with that. That's what they do. And so you've got higher administrative costs, plus profit on top of that. And if you are going to save any money through what Governor Romney's proposing, what has to happen is, is that the money has to come from somewhere. And when you move to a voucher system, you are putting seniors at the mercy of those insurance companies. And over time, if traditional Medicare has decayed or fallen apart, then they're stuck. And this is the reason why AARP has said that your plan would weaken Medicare substantially. And that's why they were supportive of the approach that we took. One last point I want to make. We do have to lower the cost of health care, not just in Medicare and Medicaid... ... but - but -- but overall. And so... Is that a — is that a separate topic? I'm sorry. Absolutely. I think this is a great example. The reason we have been in such a enormous economic crisis was prompted by reckless behavior across the board. Now, it wasn't just on Wall Street. You had loan officers were — that were giving loans and mortgages that really shouldn't have been given, because the folks didn't qualify. You had people who were borrowing money to buy a house that they couldn't afford. You had credit agencies that were stamping these as Al great investments when they weren't. But you also had banks making money hand over fist, churning out products that the bankers themselves didn't even understand, in order to make big profits, but knowing that it made the entire system vulnerable. So what did we do? We stepped in and had the toughest reforms on Wall Street since the 1930s. We said you've got — banks, you've got to raise your capital requirements. You can't engage in some of this risky behavior that is putting Main Street at risk. We've going to make sure that you've got to have a living will so — so we can know how you're going to wind things down if you make a bad bet so we don't have other taxpayer bailouts. In the meantime, by the way, we also made sure that all the help that we provided those banks was paid back every single dime, with interest. Now, Governor Romney has said he wants to repeal Dodd-Frank. And, you know, I appreciate and it appears we've got some agreement that a marketplace to work has to have some regulation. But in the past, Governor Romney has said he just want to repeal Dodd- Frank, roll it back. And so the question is: Does anybody out there think that the big problem we had is that there was too much oversight and regulation of Wall Street? Because if you do, then Governor Romney is your candidate. But that's not what I believe. Well, four years ago, when I was running for office, I was traveling around and having those same conversations that Governor Romney talks about. And it wasn't just that small businesses were seeing costs skyrocket and they couldn't get affordable coverage even if they wanted to provide it to their employees. It wasn't just that this was the biggest driver of our federal deficit, our overall health care costs, but it was families who were worried about going bankrupt if they got sick, millions of families, all across the country. If they had a pre-existing condition, they might not be able to get coverage at all. If they did have coverage, insurance companies might impose an arbitrary limit. And so as a consequence, they're paying their premiums, somebody gets really sick, lo and behold, they don't have enough money to pay the bills, because the insurance companies say that they've hit the limit. So we did work on this, alongside working on jobs, because this is part of making sure that middle-class families are secure in this country. And let me tell you exactly what Obamacare did. Number one, if you've got health insurance, it doesn't mean a government takeover. You keep your own insurance. You keep your own doctor. But it does say insurance companies can't jerk you around. They can't impose arbitrary lifetime limits. They have to let you keep your kid on their insurance — your insurance plan until you're 26 years old. And it also says that you're going to have to get rebates if insurance companies are spending more on administrative costs and profits than they are on actual care. Number two, if you don't have health insurance, we're essentially setting up a group plan that allows you to benefit from group rates that are typically 1 8 percent lower than if you're out there trying to get insurance on the individual market. Now, the last point I'd make before... No, I think — I had five seconds before you interrupted me, was ... ... the irony is that we've seen this model work really well in Massachusetts, because Governor Romney did a good thing, working with Democrats in the state to set up what is essentially the identical model and as a consequence people are covered there. It hasn't destroyed jobs. And as a consequence, we now have a system in which we have the opportunity to start bringing down costs, as opposed to just leaving millions of people out in the cold. Governor Romney said this has to be done on a bipartisan basis. This was a bipartisan idea. In fact, it was a Republican idea. And Governor Romney at the beginning of this debate wrote and said what we did in Massachusetts could be a model for the nation. And I agree that the Democratic legislators in Massachusetts might have given some advice to Republicans in Congress about how to cooperate, but the fact of the matter is, we used the same advisers, and they say it's the same plan. It — when Governor Romney talks about this board, for example, unelected board that we've created, what this is, is a group of health care experts, doctors, et cetera, to figure out, how can we reduce the cost of care in the system overall? Because there — there are two ways of dealing with our health care crisis. One is to simply leave a whole bunch of people uninsured and let them fend for themselves, to let businesses figure out how long they can continue to pay premiums until finally they just give up, and their workers are no longer getting insured, and that's been the trend line. Or, alternatively, we can figure out, how do we make the cost of care more effective? And there are ways of doing it. So at Cleveland Clinic, one of the best health care systems in the world, they actually provide great care cheaper than average. And the reason they do is because they do some smart things. They — they say, if a patient's coming in, let's get all the doctors together at once, do one test instead of having the patient run around with 10 tests. Let's make sure that we're providing preventive care so we're catching the onset of something like diabetes. Let's — let's pay providers on the basis of performance as opposed to on the basis of how many procedures they've — they've engaged in. Now, so what this board does is basically identifies best practices and says, let's use the purchasing power of Medicare and Medicaid to help to institutionalize all these good things that we do. And the fact of the matter is that, when Obamacare is fully implemented, we're going to be in a position to show that costs are going down. And over the last two years, health care premiums have gone up — it's true — but they've gone up slower than any time in the last 50 years. So we're already beginning to see progress. In the meantime, folks out there with insurance, you're already getting a rebate. Let me make one last point. Governor Romney says, we should replace it, I'm just going to repeal it, but — but we can replace it with something. But the problem is, he hasn't described what exactly we'd replace it with, other than saying we're going to leave it to the states. But the fact of the matter is that some of the prescriptions that he's offered, like letting you buy insurance across state lines, there's no indication that that somehow is going to help somebody who's got a pre-existing condition be able to finally buy insurance. In fact, it's estimated that by repealing Obamacare, you're looking at 50 million people losing health insurance... ... at a time when it's vitally important. Let me just point out first of all this board that we're talking about can't make decisions about what treatments are given. That's explicitly prohibited in the law. But let's go back to what Governor Romney indicated, that under his plan, he would be able to cover people with preexisting conditions. Well, actually Governor, that isn't what your plan does. What your plan does is to duplicate what's already the law, which says if you are out of health insurance for three months, then you can end up getting continuous coverage and an insurance company can't deny you if you've — if it's been under 90 days. But that's already the law and that doesn't help the millions of people out there with preexisting conditions. There's a reason why Governor Romney set up the plan that he did in Massachusetts. It wasn't a government takeover of health care. It was the largest expansion of private insurance. But what it does say is that insurers, you've got to take everybody. Now, that also means that you've got more customers. But when — when Governor Romney says that he'll replace it with something, but can't detail how it will be in fact replaced and the reason he set up the system he did in Massachusetts was because there isn't a better way of dealing with the preexisting conditions problem. It just reminds me of, you know, he says that he's going to close deductions and loopholes for his tax plan. That's how it's going to be paid for, but we don't know the details. He says that he's going to replace Dodd-Frank, Wall Street reform, but we don't know exactly which ones. He won't tell us. He now says he's going to replace Obamacare and ensure that all the good things that are in it are going to be in there and you don't have to worry. And at some point, I think the American people have to ask themselves, is the reason that Governor Romney is keeping all these plans to replace secret because they're too good? Is it — is it because that somehow middle-class families are going to benefit too much from them? No. The reason is, is because, when we reform Wall Street, when we tackle the problem of pre- existing conditions, then, you know, these are tough problems and we've got to make choices. And the choices we've made have been ones that ultimately are benefiting middle-class families all across the country. Well, I definitely think there are differences. The first role of the federal government is to keep the American people safe. That's its most basic function. And as commander-in-chief, that is something that I've worked on and thought about every single day that I've been in the Oval Office. But I also believe that government has the capacity, the federal government has the capacity to help open up opportunity and create ladders of opportunity and to create frameworks where the American people can succeed. Look, the genius of America is the free enterprise system and freedom and the fact that people can go out there and start a business, work on an idea, make their own decisions. But as Abraham Lincoln understood, there are also some things we do better together. So, in the middle of the Civil War, Abraham Lincoln said, let's help to finance the Transcontinental Railroad, let's start the National Academy of Sciences, let's start land grant colleges, because we want to give these gateways of opportunity for all Americans, because if all Americans are getting opportunity, we're all going to be better off. That doesn't restrict people's freedom. That enhances it. And so what I've tried to do as president is to apply those same principles. And when it comes to education what I've said is we've got to reform schools that are not working. We use something called Race to the Top. Wasn't a top-down approach, Governor. What we've said is to states, we'll give you more money if you initiate reforms. And as a consequence, you had 46 states around the country who have made a real difference. But what I've also said is let's hire another 100,000 math and science teachers to make sure we maintain our technological lead and our people are skilled and able to succeed. And hard-pressed states right now can't all do that. In fact we've seen layoffs of hundreds of thousands of teachers over the last several years, and Governor Romney doesn't think we need more teachers. I do, because I think that that is the kind of investment where the federal government can help. It can't do it all, but it can make a difference. And as a consequence we'll have a better trained workforce and that will create jobs because companies want to locate in places where we've got a skilled workforce. Well, as I've indicated, I think that it has a significant role to play. Through our Race to the Top program, we've worked with Republican and Democratic governors to initiate major reforms, and they're having an impact right now. You know, this is where budgets matter, because budgets reflect choices. So when Governor Romney indicates that he wants to cut taxes and potentially benefit folks like me and him, and to pay for it we're having to initiate significant cuts in federal support for education, that makes a difference. You know, his — his running mate, Congressman Ryan, put forward a budget that reflects many of the principles that Governor Romney's talked about. And it wasn't very detailed. This seems to be a trend. But — but what it did do is to — if you extrapolated how much money we're talking about, you'd look at cutting the education budget by up to 20 percent. When it comes to community colleges, we are seeing great work done out there all over the country because we have the opportunity to train people for jobs that exist right now. And one of the things I suspect Governor Romney and I probably agree on is getting businesses to work with community colleges so that they're setting up their training programs... Let me just finish the point. The — where they're partnering so that they're designing training programs. And people who are going through them know that there's a job waiting for them if they complete it. That makes a big difference, but that requires some federal support. Let me just say one final example. When it comes to making college affordable, whether it's two- year or four-year, one of the things that I did as president was we were sending $60 billion to banks and lenders as middlemen for the student loan program, even though the loans were guaranteed. So there was no risk for the banks or the lenders, but they were taking billions out of the system. And we said, Why not cut out the middleman? And as a consequence, what we've been able to do is to provide millions more students assistance, lower or keep low interest rates on student loans. And this is an example of where our priorities make a difference. Governor Romney, I genuinely believe cares about education, but when he tells a student that, you know, you should borrow money from your parents to go to college, you know, that indicates the degree to which, you know, there may not be as much of a focus on the fact that folks like myself, folks like Michelle, kids probably who attend University of Denver, just don't have that option. And for us to be able to make sure that they've got that opportunity and they can walk through that door, that is vitally important not just to those kids. It's how we're going to grow this economy over the long term. You've done a great job. Well, first of all, I think Governor Romney's going to have a busy first day, because he's also going to repeal Obamacare, which will not be very popular among Democrats as you're sitting down with them. But, look, my philosophy has been, I will take ideas from anybody, Democrat or Republican, as long as they're advancing the cause of making middle-class families stronger and giving ladders of opportunity to the middle class. That's how we cut taxes for middle- class families and small businesses. That's how we cut a trillion dollars of spending that wasn't advancing that cause. That's how we signed three trade deals into law that are helping us to double our exports and sell more American products around the world. That's how we repealed don't ask/don't tell. That's how we ended the war in Iraq, as I promised, and that's how we're going to wind down the war in Afghanistan. That's how we went after Al Qaida and bin Laden. So we've — we've seen progress even under Republican control of the House of Representatives. But, ultimately, part of being principled, part of being a leader is, A, being able to describe exactly what it is that you intend to do, not just saying, I'll sit down, but you have to have a plan. Number two, what's important is occasionally you've got to say no, to — to — to folks both in your own party and in the other party. And, you know, yes, have we had some fights between me and the Republicans when — when they fought back against us reining in the excesses of Wall Street? Absolutely, because that was a fight that needed to be had. When — when we were fighting about whether or not we were going to make sure that Americans had more security with their health insurance and they said no, yes, that was a fight that we needed to have. And so part of leadership and governing is both saying what it is that you are for, but also being willing to say no to some things. And I've got to tell you, Governor Romney, when it comes to his own party during the course of this campaign, has not displayed that willingness to say no to some of the more extreme parts of his party. Well, Jim, I want to thank you, and I want to thank Governor Romney, because I think was a terrific debate, and I very much appreciate it. And I want to thank the University of Denver. You know, four years ago, we were going through a major crisis. And yet my faith and confidence in the American future is undiminished. And the reason is because of its people, because of the woman I met in North Carolina who decided at 55 to go back to school because she wanted to inspire her daughter and now has a job from that new training that she's gotten; because a company in Minnesota who was willing to give up salaries and perks for their executives to make sure that they didn't lay off workers during a recession. The auto workers that you meet in Toledo or Detroit take such pride in building the best cars in the world, not just because of a paycheck, but because it gives them that sense of pride, that they're helping to build America. And so the question now is how do we build on those strengths. And everything that I've tried to do, and everything that I'm now proposing for the next four years in terms of improving our education system or developing American energy or making sure that we're closing loopholes for companies that are shipping jobs overseas and focusing on small businesses and companies that are creating jobs here in the United States, or closing our deficit in a responsible, balanced way that allows us to invest in our future. All those things are designed to make sure that the American people, their genius, their grit, their determination, is — is channeled and — and they have an opportunity to succeed. And everybody's getting a fair shot. And everybody's getting a fair share — everybody's doing a fair share, and everybody's playing by the same rules. You know, four years ago, I said that I'm not a perfect man and I wouldn't be a perfect president. And that's probably a promise that Governor Romney thinks I've kept. But I also promised that I'd fight every single day on behalf of the American people, the middle class, and all those who were striving to get into the middle class. I've kept that promise and if you'll vote for me, then I promise I'll fight just as hard in a second term."
watsonString = twitter_text_input
var params = {
  // Get the content items from the JSON file.
  //content_items: require('./profile.json').contentItems,
  text: watsonString,
  consumption_preferences: true,
  raw_scores: true,
  headers: {
    'accept-language': 'en',
    'accept': 'application/json'
  }
};

personality_insights.profile(params, function(error, response) {
  if (error)
    console.log('error:', error);
  else
    //console.log(JSON.stringify(response, null, 2));
    console.log(response);
  });
}//end of function


app.post('/test', function(req, res) {
    console.log('user clicked button');
    //console.log(JSON.stringify(req));
    console.log(JSON.stringify(req.body));
    console.log(JSON.stringify(req.body.data1));

    var info = {
      id: "user_id_here",
	    geneticData: {
        "snp1location": "AT",
        "snp2location": "CG",
	    },
      traits: ["likes to read", "likes movies"]
    }

    //db.insertUser(info);
    //console.log(JSON.stringify(db.getAssociations(['likes to read', 'likes movies', 'likes nothing'], 'TraitstoDNA')));
    var testData = {
      "snp1location": "AT",
      "id": "fakeid"
    }
    console.log(JSON.stringify(db.getAssociations(testData, "DNAtoTraits")));
    res.send({status: "Success"});
});

app.post('/send-to-server', function(req, res) {
    console.log('user is sending client data');
    //console.log(JSON.stringify(req));
    console.log(JSON.stringify(req.body));
    //console.log(JSON.stringify(req.body.data1));

    /*var info = {
      id: "user_id_here",
	    geneticData: {
        "snp1location": "AT",
        "snp2location": "CG",
	    },
      traits: ["likes to read", "likes movies"]
    }*/
  request.post('https://api.23andme.com/token/', {
      form: {
        client_id : 'be256e46c1e76dd5e8c76197f9168bed' ,
        client_secret : 'fdc2dceabe85b0336e7bc99b5eb6a4c3' ,
        grant_type: 'authorization_code',
        code : req.body.code ,
        redirect_uri : 'http://localhost:8080/genometoken',
        scope :'genomes basic'
      },
      json: true
    }, function (error, response, body) {
      // assert.equal(typeof body, 'object')
      if(error) {
          console.log(error);
      } else {
          console.log(response.statusCode, body);
          console.log(body.access_token);
          var accessToken = body.access_token;
          //getting the user id
          request({
              url: 'https://api.23andme.com/1/user/', //URL to hit
              method: 'GET', //Specify the method
              headers: { //We can define headers too
                  'Authorization': 'Bearer' + ' ' + accessToken
              }
          }, function(error, response, body){
              if(error) {
                  console.log(error);
              } else {
                  console.log(response.statusCode, body);
                  body = JSON.parse(body);
                  console.log(body.profiles[0].id);
              }
          });
        }
    });

    Twitter_API(req.body.twitterHandle);

    res.send({status: "Success"});
});
