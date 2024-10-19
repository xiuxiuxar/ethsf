set -e 

if test -d chit_chat; then
    echo "Removing previous agent build"
    rm -rf chit_chat
fi

# fetch the agent from the local package registry
echo "Fetching agent $1 from the local package registry..."
aea -s fetch $1 --local > /dev/null

# go to the new agent
# n the format eightballer/automation_station, we need to split by / nad go into the second part

agent_name=$(echo $1 | cut -d'/' -f2)
agent_author=$(echo $1 | cut -d'/' -f1)

echo "   Agent author: $agent_author"
echo "   Agent name:   $agent_name"

cd $agent_name


# create and add a new ethereum key
if [ ! -f ../ethereum_private_key.txt ]; then
    aea -s generate-key ethereum && aea -s add-key ethereum
else
    cp ../ethereum_private_key.txt ./ethereum_private_key.txt
    aea -s add-key ethereum 
fi
# install any agent deps
aea -s install

# issue certificates for agent peer-to-peer communications
if [ ! -f ../certs ]; then
    aea -s issue-certificates
else
    cp -r ../certs ./
fi

tries=0
tm_started=false
while [ $tries -lt 20 ]; do
    tries=$((tries+1))
    if curl localhost:8080/hard_reset > /dev/null 2>&1; then
        echo "Tendermint node is ready."
        tm_started=true
        break
    fi
    echo "Tendermint node is not ready yet, waiting..."
    sleep 1
done

if [ "$tm_started" = false ]; then
    echo "Tendermint node did not start in time. Please verify that the docker tendermint node is running."
    exit 1
fi

echo "Starting the agent..."

# finally, run the agent
if [ -z "$2" ]; then
    aea -s run 
else
    aea -s -v DEBUG run
fi
